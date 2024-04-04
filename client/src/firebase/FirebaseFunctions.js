import firebase from 'firebase/app';
import axios from 'axios';

async function doCreateUserWithEmailAndPassword(email, password, firstName, lastName) {
  await firebase.auth().createUserWithEmailAndPassword(email, password);
  await firebase.auth().currentUser.updateProfile({ displayName: firstName + " " + lastName });
  const accessToken = getSessionToken();
  const formData = {
    email: email,
    password: password,
    firstName: firstName,
    lastName: lastName,
    uid: firebase.auth().currentUser.uid
  };
  await axios({
    method: 'post',
    url: 'http://localhost:3001/signup',
    data: formData,
    headers: {email: email, accesstoken: accessToken}
  }).catch(function (error) {
    console.log(error);
  });

}

async function doChangePassword(email, oldPassword, newPassword) {
  let credential = firebase.auth.EmailAuthProvider.credential(
    email,
    oldPassword
  );
  await firebase.auth().currentUser.reauthenticateWithCredential(credential);
  await firebase.auth().currentUser.updatePassword(newPassword);
  const accessToken = getSessionToken();
  const formData = {
    email: email,
    oldPassword: oldPassword,
    newPassword: newPassword
  };
  await axios({
    method: 'post',
    url: 'http://localhost:3001/changeUserPW',
    data: formData,
    headers: {email: email, accesstoken: accessToken}
  });
  await doSignOut();
}

async function doChangeUserInfo(email, firstName, lastName) {
  await firebase.auth().currentUser.updateProfile({ displayName: firstName + " " + lastName });
  const accessToken = getSessionToken();
  const formData = {
    email: email,
    firstName: firstName,
    lastName: lastName
  };
  await axios({
    method: 'post',
    url: 'http://localhost:3001/changeUserInfo',
    data: formData,
    headers: {email: email, accesstoken: accessToken}
  });
}

async function doSignInWithEmailAndPassword(email, password) {
  await firebase.auth().signInWithEmailAndPassword(email, password);
  const accessToken = getSessionToken();
  const formData = {
    email: email,
    password: password
  };
  await axios({
    method: 'post',
    url: 'http://localhost:3001/login',
    data: formData,
    headers: {email: email, accesstoken: accessToken}
  }).catch(function (error) {
    if (error.response.data.error === "User not found") {
      axios({
        method: 'post',
        url: 'http://localhost:3001/signup',
        data: {
          email: firebase.auth().currentUser.email, firstName: firebase.auth().currentUser.displayName, lastName: "Unkown",
          password: password, uid: firebase.auth().currentUser.uid
        },
        headers: {email: email, accesstoken: accessToken}
      });
    }
  });
}

async function doSignOut() {
  await firebase.auth().signOut();
  axios({
    method: 'get',
    url: 'http://localhost:3001/logout'
  });
}

function getSessionToken(){
  try {
    const authToken = JSON.parse(JSON.stringify(firebase.auth().currentUser)).stsTokenManager.accessToken;
    return authToken;
  } catch (e) {
    console.log("Couldn't get firebase token from current session. Please sign in again " + e);
  }
}

export {
  doCreateUserWithEmailAndPassword,
  doSignInWithEmailAndPassword,
  doSignOut,
  doChangePassword,
  doChangeUserInfo,
  getSessionToken
};
