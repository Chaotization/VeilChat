import React, {useContext, useState} from 'react';
import {AuthContext} from '../context/AuthContext.jsx';
import {doChangePassword} from '../firebase/FirebaseFunctions.js';
import '../App.css';

function ChangePassword() {
    const {currentUser} = useContext(AuthContext);
    const [pwMatch, setPwMatch] = useState('');
    console.log(currentUser);

    const submitForm = async (event) => {
        event.preventDefault();
        const {currentPassword, newPasswordOne, newPasswordTwo} =
            event.target.elements;

        if (newPasswordOne.value !== newPasswordTwo.value) {
            setPwMatch('New Passwords do not match, please try again');
            return false;
        }

        try {
            await doChangePassword(
                currentUser.email,
                currentPassword.value,
                newPasswordOne.value
            );
            alert('Password has been changed, you will now be logged out');
        } catch (error) {
            alert(error);
        }
    };
    return(
        <div>
       {currentUser.providerData[0].providerId === 'password' ?(
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Change Your Password, {currentUser.displayName}</h2>
      <form onSubmit={submitForm} className="space-y-4">
        {pwMatch && <h4 className="text-red-500 font-bold mb-4">{pwMatch}</h4>}
  
        <div className="flex flex-col mb-4">
          <label htmlFor="currentPassword" className="text-sm font-medium mb-2">
            Current Password:
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            placeholder="Current Password"
            autoComplete="off"
            required
          />
        </div>
  
        <div className="flex flex-col mb-4">
          <label htmlFor="newPasswordOne" className="text-sm font-medium mb-2">
            New Password:
          </label>
          <input
            type="password"
            id="newPasswordOne"
            name="newPasswordOne"
            className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            placeholder="Password"
            autoComplete="off"
            required
          />
        </div>
  
        <div className="flex flex-col mb-4">
          <label htmlFor="newPasswordTwo" className="text-sm font-medium mb-2">
            Confirm New Password:
          </label>
          <input
            type="password"
            id="newPasswordTwo"
            name="newPasswordTwo"
            className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            placeholder="Confirm Password"
            autoComplete="off"
            required
          />
        </div>
  
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Change Password
        </button>
      </form>
    </div>
  ): (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">
        {currentUser.displayName}, Password Change Unavailable
      </h2>
      <p className=" mb-0">
        You are signed in using a Social Media Provider. Password change is not
        available.
      </p>
    </div>
  )}
  </div>
)
}

export default ChangePassword;