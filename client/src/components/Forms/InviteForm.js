import React,{useState, useContext} from 'react';
import axios from 'axios';
import '../../App.css';
import { useParams } from 'react-router-dom';
import {AuthContext} from '../../firebase/Auth';
import firebase from 'firebase/app';
import { getSessionToken } from '../../firebase/FirebaseFunctions';


function InviteForm(){

	const {currentUser} = useContext(AuthContext);
	const [userEmail,setUserEmail] = useState("");
	const email = firebase.auth().currentUser.email;
	const accessToken = getSessionToken();
	const headers = {headers: {
		email : email,
		accesstoken: accessToken
	}};
	const params = useParams();
	console.log(params);

	const handleSubmit = async (e) =>{
		e.preventDefault();
		console.log(currentUser);
		try {
			await axios.post(`http://localhost:3001/schedules/${params.scheduleId}/invite`,{userEmail},headers);
	} catch (e) {
			console.log(e);
	}
  }
	return (
		<div>
			<h3>Send Invites</h3>
			<h4>Please enter invitee email address</h4>
		<form onSubmit={handleSubmit}>
			<label>
				Enter User email:
				<input type="email" placeholder = "enter email" onChange={(e) => setUserEmail(e.target.value)}/>
			</label>
			<input type="submit"/>
		</form>
		</div>
	)
}

export default InviteForm;