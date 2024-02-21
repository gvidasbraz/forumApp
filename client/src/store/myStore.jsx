import { create } from 'zustand';

export const useStore = create((set) => ({
  user: [],
  setUser: (data) => set((state) => ({ user: data })),
  bills: [],
  setBills: (data) => set((state) => ({ bills: data })),
  unreadMessagesCount: 0,
  setUnreadMessagesCount: (count) =>
    set((state) => ({ unreadMessagesCount: count })),
  selectedUser: [],
  setSelectedUser: (user) => set((state) => ({ selectedUser: user })),
}));
