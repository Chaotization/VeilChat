import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import CheckUser from './CheckUser.jsx';
function Home(props) {
  if(props && props.tested){

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-4">Welcome, {props.firstName.charAt(0).toUpperCase()+props.firstName.slice(1) || "User"}!</h1>
          <p className="py-6">This is the Protected Home page.</p>
          <NavLink to='/searchuser'><button className="btn btn-primary">Get Started</button></NavLink>
        </div>
      </div>
    </div>
  );}
  else
  { 
   return <div><CheckUser/></div>
  }
}

export default Home;