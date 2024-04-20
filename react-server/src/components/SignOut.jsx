import React from 'react';
import {doSignOut} from '../firebase/FirebaseFunctions.js';
import '../App.css';
const SignOutButton = () => {
    return (
        <button className='button' type='button' onClick={doSignOut}>
            Sign Out
        </button>
    );
};

export default SignOutButton;