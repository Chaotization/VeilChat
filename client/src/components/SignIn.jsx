import React,{useState,useContext} from "react";
import {useNavigate, Link} from "react-router-dom";
import AuthContext from './AuthContext';

const SignIn=()=>
{
    const navigate=useNavigate();
    const [error, setError]=useState(null);
    const { loggedIn, handleLogin } = useContext(AuthContext);
    if(!loggedIn)
    {
    async function handleSignIn(event)
    {
        event.preventDefault();
        
        let email=document.getElementById("email").value.trim();
        let password=document.getElementById("password").value.trim();
        if(!email || !password)
        {
            setError("Email/password shouldn't be empty");
            return;
        }
        try {
            const response = await fetch(`http://localhost:4000/login`, {
              method: "POST",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                password
              })
            });
            const data = await response.json();
            if (!response.ok) {
            if (data && data.message) {
                setError(JSON.stringify(data.message));
                return
              } else {
                setError("An error occurred while logging in");
                return
              }
            }
          if(data.message==="success"){
            handleLogin();
            navigate("/");
            alert("User successfully logged in");
            return
          }
          } catch (error) {
            setError(error.message || "An error occurred while logging in");
          }     
    }
    return(
        <div className="container">
            <h2 style={{textAlign:"center"}}>Login</h2>
        <form onSubmit={handleSignIn} id='form' className="flex flex-col space-y-4">
        <div className="container mx-auto">
          <div className="card bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="card-body">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email:
              </label>
              <input type="email" id="email" required={true} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
             <br/>
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mt-4 mb-2">
                Password:
              </label>
              
              <input type="password" id="password" required={true} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
              <br/>
              <button type="submit" id="login-button" className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" >
                Login
              </button>
            </div>
            {error && <p className="text-center text-red" style={{color:"red"}}>{error}</p>}
          </div>
          <Link to="/signup">Create account</Link>
        </div>
      </form>
      </div>
      
    )
}
else
{
    alert('You can not login again.. you should logout first')
    navigate('/')
}

}

export default SignIn;