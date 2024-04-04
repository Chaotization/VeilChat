import React, {useState, useEffect, useContext} from 'react';
import firebase from 'firebase/app';
import { getSessionToken } from '../firebase/FirebaseFunctions';
import {AuthContext} from '../firebase/Auth';
import '../App.css';
import {Link} from 'react-router-dom';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.css';
import AddSchedule from './AddSchedule';

function Schedules() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [schedulesData, setSchedulesData] = useState(undefined);
  const [addBtnToggle, setBtnToggle] = useState(false);
  const {currentUser} = useContext(AuthContext);
  let list = null;

  const email = firebase.auth().currentUser.email;
  const accessToken = getSessionToken();
  const headers = {headers: {
    email : email,
    accesstoken: accessToken,
    'Access-Control-Allow-Origin':'*'
  }};

	async function fetchData() {
		try {
			setLoading(true);
			const {data} = await axios.get(
				'http://localhost:3001/schedules',
				headers
			);
			console.log(data);
			setSchedulesData(data);
			setLoading(false);
		} catch (e) {
			setError(true);
			setLoading(false);
			console.log(e);
		}
	};
  useEffect(() => {
    console.log('on load useEffect');
    fetchData();
  }, []);
  
	function handler(){
		fetchData();
 }


  const buildCard = (schedule) => {
    return (
      <Card key={schedule._id}>
        <Card.Body>
          <Card.Title>{schedule.name}</Card.Title>
          <Link to={`/schedules/${schedule._id}`}>
            <Card.Text>More Info</Card.Text>
          </Link>
        </Card.Body>
      </Card>
    )
  }

  list = 
    schedulesData 
    && schedulesData.map((schedule) => {
      return buildCard(schedule);
    });

  if (loading) {
    console.log('loading');
    return (
      <div>
        <h2>Loading. . . .</h2>
      </div>
    );
  } else if (error) {
    console.log(error);
    return(
      <div>
        <h2>404 Page Not Found.</h2>
      </div>
    );
  } else {
    return (
      <div className="content">
        <br />
        <h1>Current Vacay Schedules</h1>
        <Button onClick={()=> setBtnToggle(!addBtnToggle)}>Create Schedule</Button>
        <br />
        {addBtnToggle && <AddSchedule handler={handler}/>}
        <br />
        <div className="container">
          <div className="row">
            {list}
          </div>
        </div>
      </div>
    );
  }
}
  
export default Schedules;
  