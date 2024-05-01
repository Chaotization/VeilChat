import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { NavLink } from 'react-router-dom';

function Home() {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-4">Welcome, {currentUser && currentUser.displayName}!</h1>
          <p className="py-6">This is the Protected Home page.</p>
          <NavLink to='/search-user'><button className="btn btn-primary">Get Started</button></NavLink>
        </div>
      </div>
    </div>
  );
}

export default Home;