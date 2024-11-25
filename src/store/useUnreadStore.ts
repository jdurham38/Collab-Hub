// useUnreadStore.ts
import {create} from 'zustand';

interface UnreadState {
  unreadCounts: { [channelId: string]: number };
  setUnreadCount: (channelId: string, count: number) => void;
  incrementUnreadCount: (channelId: string) => void;
  resetUnreadCount: (channelId: string) => void;
}

export const useUnreadStore = create<UnreadState>((set) => ({
  unreadCounts: {},
  setUnreadCount: (channelId, count) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: count,
      },
    })),
  incrementUnreadCount: (channelId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: (state.unreadCounts[channelId] || 0) + 1,
      },
    })),
  resetUnreadCount: (channelId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [channelId]: 0,
      },
    })),
}));
