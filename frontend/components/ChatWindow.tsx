'use client';
import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import {
    PaperAirplaneIcon,
    XMarkIcon,
    MinusIcon,
    PhoneIcon,
} from '@heroicons/react/24/outline';

interface ChatWindowProps {
    chatId: string;
    onClose: () => void;
    minimized?: boolean;
    onMinimize?: () => void;
}

export default function ChatWindow({
    chatId,
    onClose,
    minimized = false,
    onMinimize
}: ChatWindowProps) {
    const { user } = useAuth();
    const { activeChat, setActiveChat, sendMessage, joinChat, connected } = useChat();
    const [message, setMessage] = useState('');
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatId) {
            setActiveChat(chatId);
            joinChat(chatId);
        }
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !connected) return;

        sendMessage(message.trim());
        setMessage('');
    };

    const handleTyping = () => {
        if (!typing) {
            setTyping(true);
            // Emit typing indicator
            setTimeout(() => setTyping(false), 3000);
        }
    };

    if (!activeChat) {
        return (
            <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <span className="font-semibold">Loading Chat...</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    const otherUser = activeChat.buyerId._id === user?._id ? activeChat.sellerId : activeChat.buyerId;

    return (
        <div className={`fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ${minimized ? 'h-14' : 'h-96'
            }`}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {otherUser.picture ? (
                        <Image
                            src={otherUser.picture}
                            alt={otherUser.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                                {otherUser.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {otherUser.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                            {activeChat.listingId.title}
                        </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>

                <div className="flex items-center space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                        <PhoneIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>

                    </button>
                    {onMinimize && (
                        <button onClick={onMinimize} className="p-1 text-gray-400 hover:text-gray-600">
                            <MinusIcon className="h-4 w-4" />
                        </button>
                    )}
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {!minimized && (
                <>
                    {/* Messages Area */}
                    <div className="h-64 overflow-y-auto p-3 space-y-3">
                        {activeChat.messages.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm mt-8">
                                <div className="mb-2">💬</div>
                                <p>Start your conversation</p>
                            </div>
                        ) : (
                            activeChat.messages.map((msg, index) => {
                                const isOwn = msg.senderId === user?._id;
                                const showAvatar = index === 0 || activeChat.messages[index - 1].senderId !== msg.senderId;

                                return (
                                    <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex items-end space-x-1 max-w-xs ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            {!isOwn && showAvatar && (
                                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                                                    {otherUser.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {!isOwn && !showAvatar && <div className="w-6"></div>}

                                            <div className={`px-3 py-2 rounded-lg ${isOwn
                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                    : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                                }`}>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                                    {formatDate(msg.timestamp.toString())}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {typing && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 px-3 py-2 rounded-lg">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-3 border-t border-gray-200">
                        <form onSubmit={handleSendMessage} className="flex space-x-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    handleTyping();
                                }}
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={!connected}
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || !connected}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <PaperAirplaneIcon className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}