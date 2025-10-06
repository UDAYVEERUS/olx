'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

function ChatComponent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  
  const { user, isAuthenticated } = useAuth();
  const { 
    chats, 
    activeChat, 
    connected, 
    fetchChats, 
    setActiveChat, 
    sendMessage, 
    joinChat 
  } = useChat();
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    
    fetchChats();
  }, [isAuthenticated]);

  useEffect(() => {
    if (chatId && connected) {
      setActiveChat(chatId);
      joinChat(chatId);
    }
  }, [chatId, connected]);

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

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Please login to access chat</h1>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '80vh' }}>
        <div className="flex h-full">
          {/* Chat List Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <div className="flex items-center mt-2">
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                chats.map((chat) => {
                  const otherUser = chat.buyerId._id === user?._id ? chat.sellerId : chat.buyerId;
                  const isActive = activeChat?._id === chat._id;
                  
                  return (
                    <button
                      key={chat._id}
                      onClick={() => {
                        setActiveChat(chat._id);
                        joinChat(chat._id);
                      }}
                      className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                        isActive ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {otherUser.picture ? (
                          <Image
                            src={otherUser.picture}
                            alt={otherUser.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {otherUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {otherUser.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.listingId.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(chat.lastActivity.toString())}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {activeChat.listingId.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Chat with {
                          activeChat.buyerId._id === user?._id 
                            ? activeChat.sellerId.name 
                            : activeChat.buyerId.name
                        }
                      </p>
                    </div>
                    {activeChat.listingId.images[0] && (
                      <Image
                        src={activeChat.listingId.images[0]}
                        alt={activeChat.listingId.title}
                        width={60}
                        height={60}
                        className="rounded-lg object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeChat.messages.map((msg, index) => {
                    const isOwn = msg.senderId === user?._id;
                    
                    return (
                      <div
                        key={index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {formatDate(msg.timestamp.toString())}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-4">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!connected}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || !connected}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center">Loading chat...</div>}>
      <ChatComponent />
    </Suspense>
  );
}