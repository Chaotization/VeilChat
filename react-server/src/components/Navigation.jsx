import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import SignOutButton from './SignOut.jsx';
import '../App.css';

const Navigation = () => {
  const { currentUser } = useContext(AuthContext);
  return <div>{currentUser ? <NavigationAuth /> : <NavigationNonAuth />}</div>;
};

const NavigationAuth = () => {


  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            <li><NavLink to='/'>Landing</NavLink></li>
            <li><NavLink to='/home'>Home</NavLink></li>
            <li><NavLink to='/account'>Account</NavLink></li>
            <li><NavLink to="/profile">Profile</NavLink></li>
          </ul>
        </div>
        <NavLink to='/' className="btn btn-ghost normal-case text-xl">VeilChat</NavLink>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal space-x-1">
          <li className='btn'><NavLink to='/'>Landing</NavLink></li>
          <li className='btn'><NavLink to='/home'>Home</NavLink></li>
          <li className='btn'><NavLink to='/account'>Account</NavLink></li>
          <li className='btn'><NavLink to='/profile'>Profile</NavLink></li>
        </ul>
      </div>
      <div className="navbar-end">
        {/* <SignOutButton /> */}
      </div>
    </div>
  );
};

const NavigationNonAuth = () => {
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            <li><NavLink to='/'>Landing</NavLink></li>
            <li><NavLink to='/signup'>Sign-up</NavLink></li>
            <li><NavLink to='/signin'>Sign-In</NavLink></li>
          </ul>
        </div>
        <NavLink to='/' className="btn btn-ghost normal-case text-xl">VeilChat</NavLink>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><NavLink to='/'>Landing</NavLink></li>
          <li><NavLink to='/signup'>Sign-up</NavLink></li>
          <li><NavLink to='/signin'>Sign-In</NavLink></li>
        </ul>
      </div>
    </div>
  );
};

export default Navigation;