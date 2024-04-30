import { create } from "zustand";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/FirebaseFunctions';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  initializeAuthListener: () => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // Fetch user info
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          set({ currentUser: docSnap.data(), isLoading: false });
          console.log("User Data:", docSnap.data());
        } else {
          console.log("No such document!");
          set({ currentUser: null, isLoading: false });
        }
      } else {
        // User is signed out
        set({ currentUser: null, isLoading: false });
      }
    });
  },
}));
