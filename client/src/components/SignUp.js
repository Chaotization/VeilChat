import React, {useContext, useState} from 'react';
import {Navigate} from 'react-router-dom';
import {doCreateUserWithEmailAndPassword} from '../firebase/FirebaseFunctions';
import {AuthContext} from '../firebase/Auth';

function SignUp() {
  const {currentUser} = useContext(AuthContext);
  const [pwMatch, setPwMatch] = useState('');
  const handleSignUp = async (e) => {
    e.preventDefault();
    const {firstName, lastName, email, passwordOne, passwordTwo} = e.target.elements;
    if (passwordOne.value !== passwordTwo.value) {
      setPwMatch('Passwords do not match');
      return false;
    }

    try {
      await doCreateUserWithEmailAndPassword(
        email.value,
        passwordOne.value,
        firstName.value,
        lastName.value
      );
    } catch (error) {
      alert(error);
    }
  };

  if (currentUser) {
    return <Navigate to='/' />;
  }

  return (
    <div>
      <h1>Sign up</h1>
      {pwMatch && <h4 className='error'>{pwMatch}</h4>}
      <form onSubmit={handleSignUp}>
        <div className='form-group'>
          <label>
            Email:
            <input
              className='form-control'
              required
              name='email'
              type='email'
              placeholder='Email'
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            Password:
            <input
              className='form-control'
              id='passwordOne'
              name='passwordOne'
              type='password'
              placeholder='Password'
              autoComplete='off'
              required
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            Confirm Password:
            <input
              className='form-control'
              name='passwordTwo'
              type='password'
              placeholder='Confirm Password'
              autoComplete='off'
              required
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            First Name:
            <input
              className='form-control'
              required
              name='firstName'
              type='text'
              placeholder='Name'
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            Last Name:
            <input
              className='form-control'
              required
              name='lastName'
              type='text'
              placeholder='Name'
            />
          </label>
        </div>
        <button id='submitButton' name='submitButton' type='submit'>
          Sign Up
        </button>
      </form>
      <br />
    </div>
  );
}

export default SignUp;
