import React, { useState } from 'react';
import {doDeleteUser, doPasswordReset} from '../firebase/FirebaseFunctions.js';
import ReactModal from 'react-modal';
let customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '50%',
        border: '1px solid #28547a',
        borderRadius: '4px'
    }
};
const DeleteUserButton = () => {
    const [showModal, setShowModal]=useState(false);
    function handleSubmit(e)
    {
        e.preventDefault();
        let pwd=document.getElementById("password").value.trim();
        if(!pwd)
        {
            alert("password is empty");
            return
        }
        doDeleteUser(password);
        return

    }
    return (
        <div>
        <button className='bg-red-400 hover:bg-red-700  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline' type='button' onClick={()=>setShowModal(!showModal)}>
            Delete Account
        </button>
        {showModal&&
             <ReactModal isOpen={showModal} name= "Delete Account" contentLabel='Delete Account' style={customStyles}>
            <form onSubmit={handleSubmit}>
            <label htmlFor='password'>
                Enter your password:
            </label>
            <input
              type="password"
              id="password"
              required={true}
              placeholder='Enter your password here'
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
            <br/>
            <button className='bg-red-400 hover:bg-red-700  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline' type='submit'>
            Confirm Deletion
        </button>
        <button
              className="bg-gradient-to-r from-gray-500 to-gray-700 hover:bg-gradient-to-l from-green-700 to-green-500  font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-lg shadow-green-500/50"
            onClick={()=>setShowModal(false)}
            >
              Cancel
            </button>
            </form>
        </ReactModal> }
        </div>
    );
};

export default DeleteUserButton;