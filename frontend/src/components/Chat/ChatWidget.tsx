'use client';
import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

interface Message {
    sender: string;
    message: string;
    timestamp: Date;
    clientId?: string;
}

export default function ChatWidget() {
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !socket) return;

        const payload = {
            sender: user?.fullName || 'Anonymous', // Simplified for MVP
            message: inputValue,
            roomId: 'global', // MVP: Global chat room
        };

        socket.emit('sendMessage', payload);
        setInputValue('');
    };

    if (!user) return null; // Hide if not logged in

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg focus:outline-none transition-transform transform hover:scale-105"
                aria-label="Toggle Chat"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 chat-window-animation">
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">Community Chat</h3>
                            <p className="text-xs text-indigo-200">
                                {isConnected ? '🟢 Online' : '🔴 Connecting...'}
                            </p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="h-96 overflow-y-auto p-4 bg-gray-50 flex flex-col space-y-3">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-10">
                                No messages yet. Say hello! 👋
                            </div>
                        )}
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender === user?.fullName; // Simple check for MVP
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-lg px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border'}`}>
                                        {!isMe && <div className="text-xs font-bold text-indigo-600 mb-1">{msg.sender}</div>}
                                        <p>{msg.message}</p>
                                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            disabled={!isConnected}
                        />
                        <button
                            type="submit"
                            title="Send Message"
                            aria-label="Send Message"
                            disabled={!isConnected || !inputValue.trim()}
                            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
