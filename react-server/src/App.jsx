import React, { useEffect, useState } from 'react'


import {Route, Routes} from 'react-router-dom';
import Account from './components/Account.jsx';
import Home from './components/ProtectedHome.jsx';
import Landing from './components/Home.jsx';
import Navigation from './components/Navigation.jsx';
import SignIn from './components/SignIn.jsx';
import SignUp from './components/SignUp.jsx';
import {AuthProvider} from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import UserFilter from './components/SearchUsers.jsx'
import Chatroom from './components/Chatroom.jsx';
import FriendChat from './components/FriendChat/FriendChat.jsx'
import { getAuth } from 'firebase/auth';
import 'tailwindcss/tailwind.css';
import './output.css';
import { useUserStore } from './context/userStore.jsx';



function App() {
    const initializeAuthListener = useUserStore(state => state.initializeAuthListener);

    useEffect(() => {
        initializeAuthListener();
    }, [initializeAuthListener]);

    return (
        <AuthProvider>
            <div className='App'>
                <header className='App-header card'>
                    <Navigation />
                </header>
                <Routes>
                    <Route path='/' element={<Landing />} />
                    <Route path='/friendchat' element={<FriendChat/>} />
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
                    <Route path='/friendchat' element={<FriendChat/>} />
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;