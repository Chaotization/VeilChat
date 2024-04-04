import axios from 'axios';
import React, {useState, useContext, useEffect} from 'react';
import {AuthContext} from '../firebase/Auth';
import firebase from 'firebase/app';
import { getSessionToken } from '../firebase/FirebaseFunctions';

function AddSchedule({handler}) {
	const {currentUser} = useContext(AuthContext);
		const [name,setName] = useState("");
		const [userEmail,setUserEmail] = useState(currentUser.email);

		const email = firebase.auth().currentUser.email;
    const accessToken = getSessionToken();
    const headers = {headers: {
      email : email,
      accesstoken: accessToken,
      'Access-Control-Allow-Origin':'*'
    }};



    const handleSubmit = async (e) => {
				e.preventDefault();
				setUserEmail(currentUser.email);
				setName(name);
				console.log(currentUser);
			try {
				let newSchedule = await axios.post("http://localhost:3001/schedules/",{name,userEmail},headers);
				handler();
			} catch (e) {
				console.log(e);
		}
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label>
                        Schedule Name:
                        <input
                            className='form-control'
                            required
                            name='name'
                            type='text'
                            placeholder='Name'
														value={name}
														onChange={(e) => setName(e.target.value)}
                        />
                    </label>
                </div>
								<input type="submit"/>
            </form>
        </div>
    );
		
}

export default AddSchedule;