import React from 'react';
import { useNavigate } from "react-router-dom";
import { doSignOut } from '../firebase/FirebaseFunctions.js';
import { getAuth } from 'firebase/auth';

const SignOutButton = () => {
    const navigate = useNavigate();
    let auth=getAuth();
    let currentUser=auth.currentUser;
    const handleSignOut = async () => {
        try {
            const response = await fetch('http://localhost:4000/logout', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ email:currentUser.email, uid:currentUser.uid }),
            });

            if (response.ok) {
                await doSignOut();
                navigate("/signin");
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
            onClick={handleSignOut}
        >
            Sign Out
        </button>
    );
};

export default SignOutButton;
