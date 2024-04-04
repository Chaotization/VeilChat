import React, {useContext} from 'react';
import {doChangePassword} from '../firebase/FirebaseFunctions';
import {AuthContext} from '../firebase/Auth';

function ChangePassword() {
  const {currentUser} = useContext(AuthContext);
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const {oldPassword, newPassword} = e.target.elements;

    try {
      await doChangePassword(
        currentUser.email,
        oldPassword.value,
        newPassword.value
      );
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      <h1> Change Password </h1>
      <form onSubmit={handleChangePassword}>
        <div className='form-group'>
          <label>
            Old Password:
            <input
              className='form-control'
              id='oldPassword'
              name='passwordOne'
              type='password'
              placeholder='Old Password'
              autoComplete='off'
              required
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            New Password:
            <input
              className='form-control'
              id='newPassword'
              name='newPassword'
              type='password'
              placeholder='New Password'
              autoComplete='off'
              required
            />
          </label>
        </div>
        <button id='submitButton' name='submitButton' type='submit'>
          Change Password
        </button>
      </form>
      <br />
    </div>
  );
}

export default ChangePassword;
