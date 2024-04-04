import React, {useContext} from 'react';
import {Navigate} from 'react-router-dom';
import {AuthContext} from '../firebase/Auth';
import {
  doSignInWithEmailAndPassword,
} from '../firebase/FirebaseFunctions';

function SignIn() {
  const {currentUser} = useContext(AuthContext);
  const handleLogin = async (event) => {
    event.preventDefault();
    let {email, password} = event.target.elements;

    try {
      await doSignInWithEmailAndPassword(email.value, password.value);
    } catch (error) {
      alert(error);
    }
  };

  if (currentUser) {
    return <Navigate to='/' />;
  }
  return (
    <div>
      <h1>Log in</h1>
      <form onSubmit={handleLogin}>
        <div className='form-group'>
          <label>
            Email:
            <input
              className='form-control'
              name='email'
              id='email'
              type='email'
              placeholder='Email'
              required
            />
          </label>
        </div>
        <div className='form-group'>
          <label>
            Password:
            <input
              className='form-control'
              name='password'
              type='password'
              placeholder='Password'
              autoComplete='off'
              required
            />
          </label>
        </div>
        <button type='submit'>Log in</button>
      </form>
      <br />
    </div>
  );
}

export default SignIn;
