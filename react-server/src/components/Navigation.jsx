import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import SignOutButton from './SignOut.jsx';
import ThemeToggle from './ThemeToggle.jsx';
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
            <li><NavLink to='/friendchat'>Friend Chat</NavLink></li>
            <li><NavLink to='/account'>Account</NavLink></li>
            <li><NavLink to="/profile">Profile</NavLink></li>
          </ul>
        </div>
        <NavLink to='/' className="btn btn-ghost normal-case text-xl">VeilChat</NavLink>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal space-x-3">
          <li className='btn border-primary'><NavLink to='/'>Landing</NavLink></li>
          <li className='btn border-primary'><NavLink to='/home'>Home</NavLink></li>
          <li className='btn border-primary'><NavLink to='/account'>Account</NavLink></li>
          <li className='btn border-primary'><NavLink to='/searchuser'>Random Chat</NavLink></li>
          <li className='btn border-primary'><NavLink to='/profile'>Profile</NavLink></li>
        </ul>
      </div>
      <div className="navbar-end space-x-8 px-2">
      <NavLink to="/friendchat"><span className="material-symbols-outlined hover:text-secondary mt-1 text-3xl">chat</span></NavLink>
      <ThemeToggle/>
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
        <ul className="menu menu-horizontal space-x-3">
          <li className='btn border-primary'><NavLink to='/'>Landing</NavLink></li>
          <li className='btn border-primary'><NavLink to='/signup'>Sign-up</NavLink></li>
          <li className='btn border-primary'><NavLink to='/signin'>Sign-In</NavLink></li>
        </ul>
      </div>
      <div className="navbar-end">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navigation;