"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SafetyNotice from "./SafetyNotice";
import { API_BASE_URL } from "@/config/api";
import { useSocket } from "@/hooks/useSocket";

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
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { socket, isConnected } = useSocket(tradeId);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/messages/trade/${tradeId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    }, [tradeId]);

    // Initial Fetch
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (msg: Message) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('user_typing', (payload: { userId: string; isTyping: boolean }) => {
            if (payload.userId !== currentUserId) {
                setOtherUserTyping(payload.isTyping);
            }
        });

        return () => {
            socket.off('receive_message');
            socket.off('user_typing');
        };
    }, [socket, currentUserId]);

    const handleTyping = () => {
        if (!socket || !isConnected) return;

        socket.emit('typing', { tradeId, isTyping: true, userId: currentUserId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing', { tradeId, isTyping: false, userId: currentUserId });
        }, 3000);
    };

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
            // Socket Emission
            if (socket && isConnected) {
                socket.emit('send_message', {
                    senderId: currentUserId,
                    receiverId: otherUserId,
                    tradeId,
                    listingId,
                    content: newMessage
                });
                // Optimistic Update (optional, but socket is fast enough usually)
                // We'll rely on the 'receive_message' event which comes back from server
                setNewMessage("");
            } else {
                // Fallback to HTTP if socket fails?
                // For Phase 11, let's stick to Socket primary
                alert("Connection lost. Reconnecting...");
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
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {isConnected ? 'Real-Time' : 'Connecting...'}
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
                {otherUserTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-500 rounded-2xl px-4 py-2 rounded-bl-none text-xs flex items-center gap-1 italic">
                            {otherUserName} is typing
                            <span className="flex gap-0.5">
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <SafetyNotice />
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
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
