import { create } from 'zustand';
import type { ChatMessage, DomainId } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  selectedDomain: DomainId | null;
  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setSelectedDomain: (domain: DomainId | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  selectedDomain: null,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedDomain: (domain) => set({ selectedDomain: domain }),
  clearMessages: () => set({ messages: [] }),
}));
