"use client";

import { useState, useEffect } from "react";
import "../home.css";

export default function SuccessionPage() {
    const [email, setEmail] = useState("demo@securebarter.com"); // Emulated identity
    const [heirs, setHeirs] = useState({
        heir1Name: "", heir1Key: "",
        heir2Name: "", heir2Key: "",
        heir3Name: "", heir3Key: "",
        heir4Name: "", heir4Key: "",
        heir5Name: "", heir5Key: "",
    });
    const [lastActivity, setLastActivity] = useState("");

    // Recovery State
    const [targetEmail, setTargetEmail] = useState("");
    const [keys, setKeys] = useState(["", "", "", "", ""]);
    const [deathDetails, setDeathDetails] = useState({
        date: "", place: "", mokhtar: "", license: ""
    });

    useEffect(() => {
        fetchHeirs();
    }, []);

    const fetchHeirs = async () => {
        const res = await fetch("http://localhost:3001/succession/me", {
            headers: { "x-user-email": email }
        });
        if (res.ok) {
            const data = await res.json();
            setHeirs(data);
            setLastActivity(data.lastActivity);
        }
    };

    const handleUpdate = async () => {
        const res = await fetch("http://localhost:3001/succession/update", {
            method: "POST",
            headers: { "x-user-email": email, "Content-Type": "application/json" },
            body: JSON.stringify(heirs)
        });
        if (res.ok) alert("Succession data updated successfully.");
    };

    const handleClaim = async () => {
        try {
            const res = await fetch("http://localhost:3001/succession/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetEmail,
                    keys,
                    deathDate: deathDetails.date,
                    deathPlace: deathDetails.place,
                    mokhtarName: deathDetails.mokhtar,
                    mokhtarLicense: deathDetails.license
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            alert("SUCCESS: " + data.message + "\n\nRecovery Token: " + data.recoveryToken);
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <main className="container" style={{ padding: '40px 20px', maxWidth: 800 }}>
            <h1 style={{ marginBottom: 10 }}>🧬 Account Succession & Continuity</h1>
            <p style={{ color: '#666', marginBottom: 30 }}>Designate your heirs to ensure your digital legacy and account continuity.</p>

            {/* SETUP SECTION */}
            <section className="card" style={{ padding: 25, marginBottom: 40, border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <h2 style={{ marginBottom: 20 }}>🛡️ My Designated Heirs</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ padding: 15, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 5 }}>Heir {i}</label>
                            <input
                                className="input"
                                placeholder="Full Name"
                                value={(heirs as any)[`heir${i}Name`] || ""}
                                onChange={e => setHeirs({ ...heirs, [`heir${i}Name`]: e.target.value })}
                                style={{ width: '100%', marginBottom: 10 }}
                            />
                            <input
                                className="input"
                                type="password"
                                placeholder="Secret Fingerprint"
                                value={(heirs as any)[`heir${i}Key`] || ""}
                                onChange={e => setHeirs({ ...heirs, [`heir${i}Key`]: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={handleUpdate} style={{ marginTop: 20 }}>Save Survival Setup</button>
            </section>

            {/* RECOVERY SECTION */}
            <section className="card" style={{ padding: 25, backgroundColor: '#fff7ed', border: '1px dashed #fdba74', borderRadius: 12 }}>
                <h2 style={{ color: '#9a3412', marginBottom: 10 }}>🆘 Advanced Death Verification Recovery</h2>
                <p style={{ fontSize: '0.9rem', color: '#7c2d12', marginBottom: 20 }}>
                    Strict 365-day inactivity rule + Lebanese Mokhtar certification required.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div>
                        <label className="label">Deceased Account Email</label>
                        <input className="input" value={targetEmail} onChange={e => setTargetEmail(e.target.value)} placeholder="Email of descendant" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                        <div>
                            <label className="label">Date of Death</label>
                            <input type="date" className="input" value={deathDetails.date} onChange={e => setDeathDetails({ ...deathDetails, date: e.target.value })} />
                        </div>
                        <div>
                            <label className="label">Place of Death</label>
                            <input className="input" value={deathDetails.place} onChange={e => setDeathDetails({ ...deathDetails, place: e.target.value })} placeholder="Lebanese District/City" />
                        </div>
                        <div>
                            <label className="label">Mokhtar Name</label>
                            <input className="input" value={deathDetails.mokhtar} onChange={e => setDeathDetails({ ...deathDetails, mokhtar: e.target.value })} placeholder="Certified Mokhtar" />
                        </div>
                        <div>
                            <label className="label">Mokhtar License #</label>
                            <input className="input" value={deathDetails.license} onChange={e => setDeathDetails({ ...deathDetails, license: e.target.value })} placeholder="Official Credentials" />
                        </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <label className="label">Enter All 5 Heir Fingerprints</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[0, 1, 2, 3, 4].map(i => (
                                <input
                                    key={i}
                                    type="password"
                                    className="input"
                                    style={{ flex: 1, minWidth: 120 }}
                                    placeholder={`Key ${i + 1}`}
                                    value={keys[i]}
                                    onChange={e => {
                                        const newKeys = [...keys];
                                        newKeys[i] = e.target.value;
                                        setKeys(newKeys);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn"
                        style={{ backgroundColor: '#9a3412', color: 'white', marginTop: 10 }}
                        onClick={handleClaim}
                    >
                        Verify Arabic Certificate & Claim Account
                    </button>
                </div>
            </section>
        </main>
    );
}
