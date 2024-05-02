import { create } from "zustand";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,

  changeChat: (chatId, user) => {
    return set({
      chatId,
      user,
    });
  },

  resetChat: () => {
    set({
      chatId: null,
      user: null,
    });
  },
}));
