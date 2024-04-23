import React from 'react';
import SignOutButton from './SignOut.jsx';
import ChangePassword from './ChangePassword.jsx';
import DeleteUserButton from './DeleteUser.jsx';

function Account() {
    return (
        <div className='max-w-md mx-auto my-8'>
            <h2 style={{fontWeight:"bold",textAlign:"center"}}>Account Page</h2>
            <ChangePassword />
            <SignOutButton />
            <br/>
            <DeleteUserButton/>
        </div>
    );
}

export default Account;