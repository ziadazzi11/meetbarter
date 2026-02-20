'use client';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/config/api';

interface Message {
    sender: { fullName: string; id: string };
    content: string;
    createdAt: string;
}

interface Conversation {
    id: string;
    participants: { id: string; fullName: string; avatarUrl?: string }[];
    messages: { content: string; createdAt: string }[];
}

export default function ChatWidget() {
    const { socket, isConnected } = useSocket();
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'LIST' | 'CHAT'>('LIST');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [newChatUserId, setNewChatUserId] = useState(''); // For MVP testing
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations on load
    useEffect(() => {
        if (isOpen && token && user) {
            fetch(`${API_BASE_URL}/messages/conversations/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setConversations(data))
                .catch(err => console.error('Failed to load conversations', err));
        }
    }, [isOpen, token]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle Socket Events
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (payload: Message) => {
            setMessages((prev) => [...prev, payload]);
            scrollToBottom();
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [socket]);

    // Join Room when entering chat
    useEffect(() => {
        if (activeConversation && socket) {
            socket.emit('joinRoom', activeConversation.id);
        }
    }, [activeConversation, socket]);

    const handleStartChatKey = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (!newChatUserId.trim()) return;

            try {
                // Call API to start trade/chat
                const res = await fetch(`${API_BASE_URL}/trades/start`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        listingId: newChatUserId, // treating input as listingId for this feature
                        offerVP: 0 // Default 0 VP offer for "asking about item"
                    })
                });

                if (res.ok) {
                    const data = await res.json();

                    if (data.message && data.message.includes("pay brokerage fee")) {
                        // MVP: Logic to handle payment. 
                        // For now, we alert the user with instructions on how to simulate payment.
                        alert(`Trade Initiated but Gated!\n\n${data.message}\n\nDEV TEST: To simulate payment, use the Listing ID "PAY:${newChatUserId}" in this box.`);
                        setNewChatUserId(""); // Clear for them to type the command
                        return;
                    }

                    alert(`Trade Initiated! Conversation created with ID: ${data.conversation.id}`);
                    setNewChatUserId("");
                    window.location.reload();
                } else {
                    const err = await res.json();
                    alert(`Error: ${err.message}`);
                }
            } catch (error) {
                console.error(error);
                alert("Failed to start trade");
            }
        }
    };

    // DEV TOOL: Simulate Payment
    // In real app, this is a button in the Trade Dashboard.
    useEffect(() => {
        if (newChatUserId.startsWith("PAY:")) {
            const tradeIdToPay = newChatUserId.split(":")[1];
            if (!tradeIdToPay) return;

            const payFee = async () => {
                try {
                    const res = await fetch(`${API_BASE_URL}/trades/${tradeIdToPay}/pay`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({})
                    });
                    const data = await res.json();
                    alert(data.message);
                    setNewChatUserId("");
                    // Reload to maybe see new chat?
                    window.location.reload();
                } catch (e) {
                    alert("Payment failed");
                }
            }
            if (confirm(`SIMULATE PAYMENT for Trade ID: ${tradeIdToPay}?`)) {
                payFee();
            }
        }
    }, [newChatUserId, token]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !socket || !activeConversation) return;

        const payload = {
            senderId: user?.id,
            content: inputValue,
            conversationId: activeConversation.id,
        };

        socket.emit('sendMessage', payload);
        // Optimistic UI update could go here
        setInputValue('');
    };

    const startNewChat = () => {
        // MVP: Just a prompt or simple input to simulate "clicking message on profile"
        if (!newChatUserId) return;
        // Logic to findOrCreate conversation would go here.
        // For now, let's assume the user already has conversations or we add a UI to creating one later.
        alert("To start a chat, go to a User Profile or Trade (Coming Soon). For now, select an existing conversation.");
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-105"
                aria-label="Toggle Chat"
            >
                {/* Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"} />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold cursor-pointer" onClick={() => {
                                    navigator.clipboard.writeText(user.id);
                                    alert("Copied ID: " + user.id);
                                }}>
                                    Messages <span className="text-[10px] opacity-70 font-normal">(My ID: {user.id.slice(0, 4)}...)</span>
                                </h3>
                            </div>
                            <span className="text-xs text-indigo-200">{isConnected ? 'Online' : '..'}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto bg-gray-50">
                        {view === 'LIST' ? (
                            <div className="divide-y divide-gray-100">
                                <div className="p-4 bg-gray-100">
                                    <input
                                        type="text"
                                        placeholder="Enter Listing ID to Request/Trade..."
                                        className="w-full text-sm p-2 rounded border"
                                        value={newChatUserId}
                                        onChange={(e) => setNewChatUserId(e.target.value)}
                                        onKeyDown={handleStartChatKey}
                                    />
                                </div>
                                {conversations.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        No conversations yet.
                                    </div>
                                ) : (
                                    conversations.map(conv => (
                                        <div
                                            key={conv.id}
                                            onClick={() => { setActiveConversation(conv); setView('CHAT'); }}
                                            className="p-4 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                                        >
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                {conv.participants.find(p => p.id !== user.id)?.fullName[0] || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate max-w-[180px]">
                                                    {conv.participants.find(p => p.id !== user.id)?.fullName || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conv.messages[0]?.content || 'Start new chat'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="p-4 flex flex-col space-y-3 min-h-full justify-end">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender.id === user.id; // Or name check if ID unavailable in simple obj
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border'}`}>
                                                <p>{msg.content}</p>
                                                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input (only in CHAT view) */}
                    {view === 'CHAT' && (
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            />
                            <button
                                type="submit"
                                title="Send"
                                aria-label="Send"
                                disabled={!inputValue.trim()}
                                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50"
                            >
                                send
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
