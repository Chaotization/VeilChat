import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import {Route, Routes} from 'react-router-dom';
import Account from './components/Account.jsx';
import Home from './components/ProtectedHome.jsx';
import Landing from './components/Home.jsx';
import Navigation from './components/Navigation.jsx';
import SignIn from './components/SignIn.jsx';
import SignUp from './components/SignUp.jsx';
import {AuthProvider} from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

function App() {
    return (
        <AuthProvider>
            <div className='App'>
                <header className='App-header card'>
                    <Navigation />
                </header>
                <Routes>
                    <Route path='/' element={<Landing />} />
                    <Route path='/home' element={<PrivateRoute />}>
                        <Route path='/home' element={<Home />} />
                    </Route>
                    <Route path='/account' element={<PrivateRoute />}>
                        <Route path='/account' element={<Account />} />
                    </Route>
                    <Route path='/signin' element={<SignIn />} />
                    <Route path='/signup' element={<SignUp />} />
                </Routes>
            </div>
        </AuthProvider>
    );
}

export default App;