import React from 'react';
import { useNavigate } from "react-router-dom";
import { doSignOut as FirebaseSignOut } from '../firebase/FirebaseFunctions.js';

const SignOutButton = () => {
    const navigate = useNavigate();
    const doSignOut = async () => {
        try {
            const response = await fetch('http://localhost:4000/logout', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                await FirebaseSignOut();
                navigate("/");
            } else {
                const error = await response.json();
                console.error('Logout failed:', error.message);
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <button
            className='bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
            type='button'
            onClick={doSignOut}
        >
            Sign Out
        </button>
    );
};

export default SignOutButton;
