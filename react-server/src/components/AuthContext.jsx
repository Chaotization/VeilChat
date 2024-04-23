import React, { createContext } from 'react';

const AuthContext = createContext({
  loggedIn: false, 
  setLoggedIn: () => {}, 
});

export default AuthContext;