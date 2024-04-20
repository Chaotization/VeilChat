import React from 'react';
import SignOutButton from './SignOut.jsx';
import ChangePassword from './ChangePassword.jsx';
import '../App.css';

function Account() {
    return (
        <div className='card'>
            <h2>Account Page</h2>
            <ChangePassword />
            <SignOutButton />
        </div>
    );
}

export default Account;