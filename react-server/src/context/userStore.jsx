import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from '../firebase/FirebaseFunctions';

//for current use
export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    console.log("fetchUserInfo called with UID:", uid);
    if (!uid) {
        console.log("No UID provided");
        return set({ currentUser: null, isLoading: false });
      }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.log(err);
      return set({ currentUser: null, isLoading: false });
    }
  },
}));