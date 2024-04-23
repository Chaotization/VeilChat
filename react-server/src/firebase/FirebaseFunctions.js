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
      
      // Re-authenticate the user
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
  
      // Delete the user account
      await deleteUser(user);
      console.log("User account deleted successfully.");
    } catch (error) {
      console.error("Error deleting user account:", error.message);
      if (error.code === "auth/network-request-failed") {
        // Retry the operation after a delay
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds
        await doDeleteUser(password); // Retry the operation
      }
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