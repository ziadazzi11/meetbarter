"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./circles.css";

export default function CirclesBrowse() {
    const router = useRouter();
    const [circles, setCircles] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);

    const DEMO_USER_ID = "9d2c7649-9cf0-48fb-889a-1369e20615a6";

    useEffect(() => {
        fetchCircles();
    }, []);

    const fetchCircles = () => {
        fetch(`http://localhost:3001/circles?userId=${DEMO_USER_ID}`)
            .then(res => res.json())
            .then(setCircles)
            .catch(console.error);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3001/circles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: DEMO_USER_ID, name, description, isPublic })
            });

            if (!res.ok) throw new Error(await res.text());

            alert("Circle Created!");
            setShowCreateModal(false);
            fetchCircles();
            setName("");
            setDescription("");
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    return (
        <div className="circles-container">
            <div className="circles-header">
                <div>
                    <h1>Trade Circles ⭕</h1>
                    <p>Join communities and trade with people you trust.</p>
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn-create">
                    + Create Circle
                </button>
            </div>

            <div className="circles-grid">
                {circles.map(circle => (
                    <div key={circle.id} className="circle-card">
                        <div className={`circle-badge ${circle.isPublic ? 'public' : 'private'}`}>
                            {circle.isPublic ? '🌍 Public' : '🔒 Private'}
                        </div>
                        <h3>{circle.name}</h3>
                        <p>{circle.description}</p>
                        <div className="circle-stats">
                            <span>👥 {circle.members?.length || 0} members</span>
                            <span>📦 {circle.listings?.length || 0} listings</span>
                        </div>

                        <Link href={`/circles/${circle.id}`} className="btn-view">
                            View Circle
                        </Link>
                    </div>
                ))}

                {circles.length === 0 && (
                    <div className="empty-state">
                        No circles found. Be the first to start a community!
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Start a New Circle</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Circle Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Beirut Book Club" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="What is this circle about?" />
                            </div>
                            <div className="form-group checkbox">
                                <label>
                                    <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                                    Public (Anyone can see listings)
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-submit">Create Circle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
