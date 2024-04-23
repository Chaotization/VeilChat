import React from 'react';
import {doSignOut} from '../firebase/FirebaseFunctions.js';

const SignOutButton = () => {
    return (
        <button className='bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline' type='button' onClick={doSignOut}>
            Sign Out
        </button>
    );
};

export default SignOutButton;