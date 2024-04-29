import React from 'react';
import {doSocialSignIn} from '../firebase/FirebaseFunctions';
import {useNavigate} from "react-router-dom";
const SocialSignIn = () => {
    let navigate=useNavigate();
    const socialSignOn = async () => {

        try {
            const response=await doSocialSignIn();
            navigate('/home')
        } catch (error) {
            alert(error)
        }
    };
    return (
        <div>
           <button><img
                onClick={() => socialSignOn()}
                alt='google signin'
                src='/imgs/btn_google_signin.png'
            /></button> 
        </div>
    );
};

export default SocialSignIn;