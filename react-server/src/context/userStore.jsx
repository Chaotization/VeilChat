import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/FirebaseFunctions';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) {
      set({ currentUser: null, isLoading: false });
      return;
    }
    
    const docRef = doc(db, "users", uid);
    
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      set({ currentUser: docSnap.data(), isLoading: false });
    } else {
      console.log("No such document!");
      set({ currentUser: null, isLoading: false });
    }
  },
}));
