import React, {useContext} from 'react';
import {doChangeUserInfo} from '../firebase/FirebaseFunctions';
import {AuthContext} from '../firebase/Auth';

function ChangeUserInfo() {
  const {currentUser} = useContext(AuthContext);
  const handleChangeInfo = async (e) => {
    e.preventDefault();
    const {firstName, lastName} = e.target.elements;

    try {
      await doChangeUserInfo(
        currentUser.email,
        firstName.value,
        lastName.value
      );
    } catch (error) {
      alert(error);
    }
    window.location.reload(false);
  };

  return (
    <div>
      <h1> Change User Info </h1>
      <form onSubmit={handleChangeInfo}>
        <div className='form-group'>
          <label>
            First Name:
            <input
              className='form-control'
              id='firstName'
              name='firstName'
              type='text'
              placeholder='First Name'
              autoComplete='on'
              required
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            Last Name:
            <input
              className='form-control'
              id='lastName'
              name='lastName'
              type='text'
              placeholder='Last Name'
              autoComplete='on'
              required
            />
          </label>
        </div>
        <button id='submitButton' name='submitButton' type='submit'>
          Change Info
        </button>
      </form>
      <br />
    </div>
  );
}

export default ChangeUserInfo;
