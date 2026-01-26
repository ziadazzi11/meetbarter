"use client";

import { useState, useEffect, useRef } from "react";
import SafetyNotice from "./SafetyNotice";

interface Message {
    id: string;
    content: string;
    senderId: string;
    sender: {
        fullName: string;
        email?: string;
    };
    createdAt: string;
}

interface MessageThreadProps {
    tradeId: string;
    currentUserId: string;
    otherUserId: string;
    listingId: string;
    otherUserName: string;
}

export default function MessageThread({ tradeId, currentUserId, otherUserId, listingId, otherUserName }: MessageThreadProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`http://localhost:3001/messages/trade/${tradeId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds for new chats
        return () => clearInterval(interval);
    }, [tradeId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await fetch("http://localhost:3001/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: currentUserId,
                    receiverId: otherUserId,
                    tradeId,
                    listingId,
                    content: newMessage
                })
            });

            if (res.ok) {
                setNewMessage("");
                fetchMessages(); // Instant refresh
            } else {
                alert("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message", error);
            alert("Error sending message");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Chat with {otherUserName}</h2>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Connection
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {loading ? (
                    <div className="flex justify-center pt-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <p>No messages yet.</p>
                        <p className="text-sm">Start the conversation to coordinate meetup details.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                    }`}>
                                    {!isMe && <div className="text-xs font-bold mb-1 opacity-70">{msg.sender.fullName}</div>}
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <SafetyNotice />
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className={`px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 ${(sending || !newMessage.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 shadow-md'
                            }`}
                    >
                        {sending ? '...' : 'Send'}
                        <span>➤</span>
                    </button>
                </form>
                <p className="text-xs text-gray-400 mt-2 text-center">
                    <span className="mr-1">🛡️</span>
                    For your safety, phone numbers and emails are hidden until the Soft Commitment is recorded.
                </p>
            </div>
        </div>
    );
}
