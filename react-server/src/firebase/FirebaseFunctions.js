import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    signInWithEmailAndPassword,
    updatePassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser
} from 'firebase/auth';
import app from './FirebaseConfig';
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
import { useNavigate } from 'react-router-dom';

async function doCreateUserWithEmailAndPassword(email, password, displayName) {
    const auth = getAuth();
    await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(auth.currentUser, {displayName: displayName});
}

async function doChangePassword(email, oldPassword, newPassword) {
    const auth = getAuth();
    let credential = EmailAuthProvider.credential(email, oldPassword);
    console.log(credential);
    await reauthenticateWithCredential(auth.currentUser, credential);

    await updatePassword(auth.currentUser, newPassword);
    await doSignOut();
}
async function doDeleteUser(password) {
    try {
      const auth = getAuth();
      
      const user = auth.currentUser;
      console.log(user.uid)
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
  
      // Delete the user account
      await deleteUser(user.uid);
      //console.log("User account deleted successfully.");
    } catch (error) {
      //console.error("Error deleting user account:", error.message);
    //   if (error.code === "auth/network-request-failed") {
    //     await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
    //     await doDeleteUser(password); // Retry the operation
    //   }
      alert('Could not delete your account right now, Signing you out');
      doSignOut();
    }
  }
  

async function doSignInWithEmailAndPassword(email, password) {
    let auth = getAuth();
    await signInWithEmailAndPassword(auth, email, password);
}

async function doSocialSignIn() {
    let auth = getAuth();
    let socialProvider = new GoogleAuthProvider();
    await signInWithPopup(auth, socialProvider);
}

async function doPasswordReset(email) {
    let auth = getAuth();
    await sendPasswordResetEmail(auth, email);
}

async function doSignOut() {
    let auth = getAuth();
    await signOut(auth);
}

export {
    doCreateUserWithEmailAndPassword,
    doSocialSignIn,
    doSignInWithEmailAndPassword,
    doPasswordReset,
    doSignOut,
    doDeleteUser,
    doChangePassword
};

export const db = getFirestore();
export const storage = getStorage();
