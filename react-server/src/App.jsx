import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useUserStore } from './context/userStore.jsx';
import Navigation from './components/Navigation.jsx';
import Home from './components/ProtectedHome.jsx';
import SignIn from './components/SignIn.jsx';
import SignUp from './components/SignUp.jsx';
import Landing from './components/Landing.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import FriendChat from './components/FriendChat/FriendChat.jsx';
import UserFilter from './components/SearchUsers.jsx';
import Chatroom from './components/Chatroom.jsx';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Profile from './components/Profile.jsx';
import Account from './components/Account.jsx';
import CheckUser from './components/CheckUser.jsx';
import Error from './components/Error.jsx';
import 'tailwindcss/tailwind.css';
import './output.css';



function App() {
    const { fetchUserInfo, currentUser, isLoading } = useUserStore();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserInfo(user.uid);
            } else {
                fetchUserInfo(null);
            }
        });

        return () => unsubscribe();
    }, [fetchUserInfo]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        
        <AuthProvider>
            <div className='App'>
                <header className='App-header card'>
                    <Navigation />
                </header>
                <Routes>
                    <Route path='/' element={<Landing />} />
                    <Route path='/friendchat' element={<FriendChat />} />
                    <Route path='/home' element={<PrivateRoute />}>
                        <Route path='/home' element={<Home />} />
                    </Route>
                    <Route path='/account' element={<PrivateRoute />}>
                        <Route path='/account' element={<Account />} />
                    </Route>
                    <Route path='/signin' element={<SignIn />} />
                    <Route path='/signup' element={<SignUp />} />
                    <Route path='/search-user' element={<UserFilter/>} />
                    <Route path='/chat/:providedChatId' element={<Chatroom/>}/>
                    <Route path='/profile' element={<Profile/>}/>
                    <Route path='/friendchat' element={<FriendChat/>} />
                    <Route path='/checker' element={<CheckUser/>}/>
                    <Route path='*' element={<Error/>}/>
                </Routes>
            </div>
        </AuthProvider>
        
    );
}

export default App;
