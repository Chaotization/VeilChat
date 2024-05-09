import React,{useState,useContext, useEffect} from "react";
import {useNavigate, Link,Navigate} from "react-router-dom";
import AuthContext from './AuthContext.jsx';
import SocialSignIn from './SocialSignIn.jsx';
import {
  doSignInWithEmailAndPassword,
  doPasswordReset,
} from '../firebase/FirebaseFunctions.js';
import { getAuth } from "firebase/auth";
import Loader from "./Loader.jsx";

const SignIn=()=>
{
    const navigate=useNavigate();
    const [error, setError]=useState(null);
    const {currentUser} = getAuth()
    const [loading, setLoading]=useState(false);

    useEffect(()=>
  {
    if (currentUser) {
      navigate('/')
      return
  }

  },[])
  

  const passwordReset = (event) => {
    event.preventDefault();
    let email = document.getElementById('email').value;
    if (email) {
        doPasswordReset(email);

        alert('Password reset email was sent');
    } else {
        alert(
            'Please enter an email address below before you click the forgot password link'
        );
    }
};
    async function handleSignIn(event) {
        event.preventDefault();
        setError("")
        
        let email=document.getElementById("email").value.trim();
        let password=document.getElementById("password").value.trim();
        if(!email || !password)
        {
            setError("Email/password shouldn't be empty");
            return;
        }

        try {

          try{
            setLoading(true);
            const loginResponse= await fetch("http://localhost:4000/login", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ email, password }),
         });
         
         if(loginResponse.ok)
         {
           //console.log("login success in backend");
           await doSignInWithEmailAndPassword(email, password);
           navigate("/")
          
         }
         setLoading(false)
       }
         catch(e)
         {
           //console.log(e);
         }
         
          
      } catch (error) {

          alert(error.code);
      }

    }
    if(loading)
    {
      return <Loader/>
    }
    return(
      <div className="max-w-md mx-auto my-8">
      <h2 className="text-center text-3xl font-bold mb-8">Login</h2>
    
      <form onSubmit={handleSignIn} id="form" className="flex flex-col space-y-4">
        <div className="bg-base-100 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="card-body">
            <label htmlFor="email" className="block  text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              required={true}
              className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
            <label htmlFor="password" className="block  text-sm font-bold mt-4 mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              required={true}
              className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
            <button
              type="submit"
              id="login-button"
              className="my-4  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
    
            {error && (
              <p className="text-center text-red-500 font-bold">{error}</p>
            )}
          </div>
        </div>
    
        <div className="flex justify-between items-center">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:bg-gradient-to-l from-blue-700 to-blue-500  font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-lg shadow-blue-500/50"
            onClick={passwordReset}
          >
            Forgot Password
          </button>
    
          <Link to="/signup">
            <button
              className="bg-gradient-to-r from-green-500 to-green-700 hover:bg-gradient-to-l from-green-700 to-green-500  font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-lg shadow-green-500/50"
            >
              Create account
            </button>
          </Link>
        </div>
    
        <br />
        <SocialSignIn />
      </form>
    </div>
    
    )
}


export default SignIn;