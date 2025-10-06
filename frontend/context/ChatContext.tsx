'use client';
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Chat, Message } from '@/types';
import { useAuth } from './AuthContext';
import io, { Socket } from 'socket.io-client';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  loading: boolean;
  connected: boolean;
}

interface ChatContextType extends ChatState {
  fetchChats: () => Promise<void>;
  createChat: (buyerId: string, sellerId: string, listingId: string) => Promise<string>;
  setActiveChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_ACTIVE_CHAT'; payload: Chat | null }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'ADD_CHAT'; payload: Chat };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };
    case 'SET_CHATS':
      return { ...state, chats: action.payload, loading: false };
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChat: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat._id === action.payload.chatId
            ? { ...chat, messages: [...chat.messages, action.payload.message] }
            : chat
        ),
        activeChat:
          state.activeChat?._id === action.payload.chatId
            ? { ...state.activeChat, messages: [...state.activeChat.messages, action.payload.message] }
            : state.activeChat,
      };
    case 'ADD_CHAT':
      return { ...state, chats: [action.payload, ...state.chats] };
    default:
      return state;
  }
};

let socket: Socket | null = null;

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, {
    chats: [],
    activeChat: null,
    loading: false,
    connected: false,
  });

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Create socket connection with auth
      socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        dispatch({ type: 'SET_CONNECTED', payload: true });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        dispatch({ type: 'SET_CONNECTED', payload: false });
      });

      socket.on('new-message', (data: { chatId: string; message: Message }) => {
        console.log('New message received:', data);
        dispatch({ type: 'ADD_MESSAGE', payload: data });
      });

      socket.on('error', (error: any) => {
        console.error('Socket error:', error);
        toast.error('Chat connection error');
      });

      return () => {
        if (socket) {
          socket.off('connect');
          socket.off('disconnect');
          socket.off('new-message');
          socket.off('error');
          socket.disconnect();
        }
      };
    }
  }, [isAuthenticated, user]);

  const fetchChats = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get('/chat/my-chats');
      console.log('Fetch chats response:', response.data); // DEBUG

      const chats = response.data?.data?.chats || response.data?.chats || [];

      // Validate chat structure
      const validChats = chats.filter((chat: any) => {
        if (!chat.buyerId || !chat.sellerId || !chat.listingId) {
          console.warn('Invalid chat structure:', chat);
          return false;
        }
        return true;
      });

      dispatch({ type: 'SET_CHATS', payload: validChats });
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setActiveChat = async (chatId: string) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      console.log('Get chat response:', response.data); // DEBUG

      const chat = response.data?.data?.chat || response.data?.chat || response.data;

      // Validate chat has required fields
      if (!chat.buyerId || !chat.sellerId || !chat.listingId) {
        console.error('Invalid chat structure:', chat);
        toast.error('Invalid chat data');
        return;
      }

      dispatch({ type: 'SET_ACTIVE_CHAT', payload: chat });
    } catch (error) {
      console.error('Error setting active chat:', error);
      toast.error('Failed to load chat');
    }
  };


  const sendMessage = (content: string) => {
    if (state.activeChat && user && socket && state.connected) {
      socket.emit('send-message', {
        chatId: state.activeChat._id,
        content,
      });
    }
  };

  const joinChat = (chatId: string) => {
    if (socket && state.connected) {
      socket.emit('join-chat', { chatId });
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket && state.connected) {
      socket.emit('leave-chat', { chatId });
    }
  };

  const createChat = async (buyerId: string, sellerId: string, listingId: string): Promise<string> => {
    try {
      const response = await api.post('/chat', { buyerId, sellerId, listingId });
      const chat = response.data?.data?.chat || response.data?.chat || response.data;
      if (!chat || !chat._id) {
        toast.error('Failed to create chat');
        throw new Error('Invalid chat data');
      }
      dispatch({ type: 'ADD_CHAT', payload: chat });
      return chat._id;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        ...state,
        fetchChats,
        createChat,
        setActiveChat,
        sendMessage,
        joinChat,
        leaveChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};