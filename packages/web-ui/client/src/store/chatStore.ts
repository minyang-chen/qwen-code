import { create } from 'zustand';

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface FileView {
  path: string;
  content: string;
}

export interface Session {
  id: string;
  createdAt: string;
  lastActivity: string;
}

export interface SessionStats {
  messageCount: number;
  estimatedTokens: number;
}

interface ChatStore {
  sessionId: string | null;
  sessions: Session[];
  messages: Message[];
  isStreaming: boolean;
  currentMessage: string;
  pendingToolCalls: ToolCall[];
  currentFile: FileView | null;
  isSettingsOpen: boolean;
  sessionStats: SessionStats | null;

  setSessionId: (id: string) => void;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  removeSession: (id: string) => void;
  addMessage: (message: Message) => void;
  appendToCurrentMessage: (text: string) => void;
  finalizeCurrentMessage: () => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
  addPendingToolCall: (toolCall: ToolCall) => void;
  approveToolCall: (id: string) => void;
  rejectToolCall: (id: string) => void;
  clearPendingToolCalls: () => void;
  openFile: (file: FileView) => void;
  closeFile: () => void;
  updateFileContent: (content: string) => void;
  openSettings: () => void;
  closeSettings: () => void;
  setSessionStats: (stats: SessionStats | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessionId: null,
  sessions: [],
  messages: [],
  isStreaming: false,
  currentMessage: '',
  pendingToolCalls: [],
  currentFile: null,
  isSettingsOpen: false,
  sessionStats: null,

  setSessionId: (id) => set({ sessionId: id }),

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),

  removeSession: (id) =>
    set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  appendToCurrentMessage: (text) =>
    set((state) => ({ currentMessage: state.currentMessage + text })),

  finalizeCurrentMessage: () => {
    const { currentMessage } = get();
    if (currentMessage.trim()) {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: currentMessage,
            timestamp: new Date(),
          },
        ],
        currentMessage: '',
      }));
    } else {
      set({ currentMessage: '' });
    }
  },

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  clearMessages: () => set({ messages: [], currentMessage: '' }),

  addPendingToolCall: (toolCall) =>
    set((state) => ({
      pendingToolCalls: [...state.pendingToolCalls, toolCall],
    })),

  approveToolCall: (id) =>
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.map((tc) =>
        tc.id === id ? { ...tc, status: 'approved' as const } : tc,
      ),
    })),

  rejectToolCall: (id) =>
    set((state) => ({
      pendingToolCalls: state.pendingToolCalls.map((tc) =>
        tc.id === id ? { ...tc, status: 'rejected' as const } : tc,
      ),
    })),

  clearPendingToolCalls: () => set({ pendingToolCalls: [] }),

  openFile: (file) => set({ currentFile: file }),

  closeFile: () => set({ currentFile: null }),

  updateFileContent: (content) =>
    set((state) => ({
      currentFile: state.currentFile ? { ...state.currentFile, content } : null,
    })),

  openSettings: () => set({ isSettingsOpen: true }),

  closeSettings: () => set({ isSettingsOpen: false }),

  setSessionStats: (stats) => set({ sessionStats: stats }),
}));
