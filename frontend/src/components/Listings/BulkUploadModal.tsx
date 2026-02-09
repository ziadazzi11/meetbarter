import { useState, useRef } from 'react';
import Image from 'next/image';
import { API_BASE_URL } from "@/config/api";
import { useAuth } from '@/context/AuthContext';
import * as XLSX from 'xlsx';

interface RowData {
    Filename?: string;
    Title?: string;
    Price?: string;
    Description?: string;
    [key: string]: string | number | undefined;
}

interface BulkItem {
    id: string; // temp id
    file: File;
    previewUrl: string;
    title: string;
    description?: string;
    priceVP: number;
    status: 'PENDING' | 'READY' | 'ERROR';
    loadingAI?: boolean;
    error?: string;
}

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
    const [items, setItems] = useState<BulkItem[]>([]);
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const parseJwt = (token: string) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch {
            return null;
        }
    };

    // Hidden inputs
    const folderInputRef = useRef<HTMLInputElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);

    // Regex for "Item Name - 150.jpg"
    // Captures: 1=Name, 2=Price
    const filenameRegex = /(.+?)\s*-\s*(\d+)/;



    // ... (existing imports)

    // ... (existing state)

    const handleExcelSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Create a map for fast lookup: Filename -> Row Data
            const excelMap = new Map<string, RowData>();
            (data as RowData[]).forEach((row) => {
                // Expects 'Filename' column, e.g., 'solar_oven.jpg' or just 'solar_oven'
                if (row.Filename) {
                    const key = row.Filename.trim().split('.')[0].toLowerCase();
                    excelMap.set(key, row);
                }
            });

            // Update items if they match
            setItems(prev => prev.map(item => {
                const itemKey = item.file.name.split('.')[0].toLowerCase();
                const match = excelMap.get(itemKey);
                if (match) {
                    return {
                        ...item,
                        title: match.Title || item.title,
                        priceVP: match.Price ? parseInt(match.Price) : item.priceVP,
                        // description: match.Description // We can add description to BulkItem interface if needed
                        status: (match.Price || item.priceVP > 0) ? 'READY' : 'PENDING'
                    };
                }
                return item;
            }));

            alert(`Parsed Excel and updated matching items!`);
        };
        reader.readAsBinaryString(file);
    };

    const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newItems: BulkItem[] = [];
        Array.from(e.target.files).forEach((file) => {
            // Only images
            if (!file.type.startsWith('image/')) return;

            // Parse filename
            const match = file.name.match(filenameRegex);
            let title = file.name.split('.')[0];
            let priceVP = 0;

            if (match) {
                title = match[1].trim();
                priceVP = parseInt(match[2]);
            }

            newItems.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                previewUrl: URL.createObjectURL(file),
                title,
                priceVP,
                status: priceVP > 0 ? 'READY' : 'PENDING'
            });
        });

        setItems(prev => [...prev, ...newItems]);
    };

    const handleUpload = async () => {
        if (items.length === 0) return;
        setLoading(true);

        const formData = new FormData();
        // @ts-expect-error
        if (token && parseJwt(token).sub) {
            // @ts-expect-error
            formData.append('sellerId', parseJwt(token).sub);
        }

        items.forEach((item, index) => {
            formData.append('files', item.file);
            // Append metadata as JSON string per file index, or separate arrays
            // For simplicity, let's send a map using filename or index
            formData.append(`meta_${index}`, JSON.stringify({
                title: item.title,
                priceVP: item.priceVP,
                description: item.description || `Imported item: ${item.title}`
            }));
        });

        try {
            const res = await fetch(`${API_BASE_URL}/listings/bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error(await res.text());

            alert(`Successfully uploaded ${items.length} items!`);
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            alert('Upload failed: ' + message);
        } finally {
            setLoading(false);
        }
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateItem = (id: string, updates: Partial<BulkItem>) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col text-white">

                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-1">AI Bulk Importer</h2>
                        <p className="text-gray-400 text-sm">Upload a folder of images. Naming convention: <code className="text-cyan-200">Item Name - 150.jpg</code></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                {/* Toolbar */}
                <div className="p-4 bg-gray-800/30 flex gap-4 border-b border-gray-800 flex-wrap">
                    <button
                        onClick={() => folderInputRef.current?.click()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium flex items-center gap-2"
                    >
                        📁 Select Folder
                    </button>
                    <input
                        type="file"
                        ref={folderInputRef}
                        // @ts-expect-error
                        webkitdirectory=""
                        directory=""
                        multiple
                        className="hidden"
                        onChange={handleFolderSelect}
                        aria-label="Upload Folder"
                    />

                    <button
                        onClick={() => excelInputRef.current?.click()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium flex items-center gap-2"
                    >
                        📊 Attach Excel (Optional)
                    </button>
                    <input
                        type="file"
                        ref={excelInputRef}
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleExcelSelect}
                        aria-label="Upload Excel"
                    />

                    <div className="flex-1"></div>

                    <div className="text-sm text-gray-400 self-center">
                        {items.length} items detected
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-black/40">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                            <p className="text-xl mb-2">No items yet</p>
                            <p>Select a folder to begin AI parsing</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {items.map(item => (
                                <div key={item.id} className="bg-gray-800 rounded-lg p-3 flex gap-3 border border-gray-700 hover:border-cyan-500/50 transition-colors">
                                    <Image 
                                        src={item.previewUrl} 
                                        alt={item.title} 
                                        title={item.title} 
                                        width={80} 
                                        height={80} 
                                        className="object-cover rounded bg-gray-900" 
                                        unoptimized
                                    />
                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <input
                                            value={item.title}
                                            onChange={e => updateItem(item.id, { title: e.target.value })}
                                            className="w-full bg-transparent border-none text-white font-medium focus:ring-0 p-0 placeholder-gray-500 text-sm"
                                            placeholder="Item Title"
                                            aria-label="Item Title"
                                        />

                                        {/* Description & AI Button */}
                                        <div className="flex gap-2">
                                            <input
                                                value={item.description || ''}
                                                onChange={e => updateItem(item.id, { description: e.target.value })}
                                                className="flex-1 bg-gray-900/50 border border-gray-700 rounded px-2 py-0.5 text-xs text-gray-300 placeholder-gray-600 focus:border-cyan-500/50"
                                                placeholder="Description (Optional)"
                                                aria-label="Item Description"
                                            />
                                            <button
                                                onClick={async () => {
                                                    updateItem(item.id, { loadingAI: true });
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('image', item.file);
                                                        formData.append('title', item.title);

                                                        const res = await fetch(`${API_BASE_URL}/listings/ai-description`, {
                                                            method: 'POST',
                                                            headers: { 'Authorization': `Bearer ${token}` },
                                                            body: formData
                                                        });

                                                        if (!res.ok) throw new Error('AI Failed');
                                                        const data = await res.json();
                                                        updateItem(item.id, { description: data.description, loadingAI: false });
                                                    } catch (e) {
                                                        console.error(e);
                                                        updateItem(item.id, { loadingAI: false });
                                                        alert('Failed to generate description. Check allowed content/API key.');
                                                    }
                                                }}
                                                disabled={item.loadingAI}
                                                className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs disabled:opacity-50"
                                                title="Generate with AI"
                                                aria-label="Generate Description with AI"
                                            >
                                                {item.loadingAI ? '✨...' : '✨'}
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-purple-400 text-xs font-bold">VP</span>
                                            <input
                                                type="number"
                                                value={item.priceVP}
                                                onChange={e => updateItem(item.id, { priceVP: parseInt(e.target.value) || 0 })}
                                                className="w-16 bg-gray-900 border border-gray-600 rounded px-1 py-0.5 text-xs text-white"
                                                aria-label="Price in VP"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 self-start">×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white">Cancel</button>
                    <button
                        onClick={handleUpload}
                        disabled={loading || items.length === 0}
                        className={`px-8 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg shadow-lg shadow-cyan-500/20 ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? 'Uploading...' : `Publish ${items.length} Items`}
                    </button>
                </div>
            </div>
        </div>
    );
}
