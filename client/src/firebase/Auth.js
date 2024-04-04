import React, {useState, useEffect} from 'react';
import firebaseApp from './Firebase';

export const AuthContext = React.createContext();

export const AuthProvider = ({children}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    firebaseApp.auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoadingUser(false);
    });
  }, []);

  if (loadingUser) {
    return (
      <div class="container">
        <h1>Loading. . . Are you having a good day</h1>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{currentUser}}>
      {children}
    </AuthContext.Provider>
  );
};
