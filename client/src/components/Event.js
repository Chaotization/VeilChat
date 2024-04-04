import React, {useState, useEffect, useContext} from 'react';
import '../App.css';
import {useParams, Link} from 'react-router-dom';
import axios from 'axios';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import {AuthContext} from '../firebase/Auth';
import { getSessionToken } from '../firebase/FirebaseFunctions';
import 'bootstrap/dist/css/bootstrap.css';

function Event () {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [eventData, setEventData] = useState(undefined);
    const [attending, setAttending] = useState(false);
    const [userData, setUserData] = useState(undefined);
    const [showBtnToggle, setBtnToggle] = useState(false);
    const {currentUser} = useContext(AuthContext);
    const accessToken = getSessionToken();
    const headers = {headers: {
      email : currentUser.email,
      accesstoken: accessToken,
      'Access-Control-Allow-Origin':'*'
    }};    
    let {scheduleId, eventId} = useParams();

    useEffect(() => {
      console.log('on load useEffect');
      async function fetchData() {
        try {
          setLoading(true);
            if(currentUser){
                const currentUserData = await axios.get('http://localhost:3001/userId/' + currentUser.email, headers);
                setUserData(currentUserData.data)
            }
          const { data } = await axios.get('http://localhost:3001/schedules/' + scheduleId + '/' + eventId, headers);
          setEventData(data);
          setAttending(data.attendees.includes(currentUser.email));
          setLoading(false);
        } catch (e) {
            setError(true);
            setLoading(false);
            console.log(e);
        }
      };
      fetchData();
    }, [scheduleId, eventId, attending, currentUser.email]);


    const buildAttendees = (attendees) => {
        let attendeeList = [];
        let item;
        for (let attendee of attendees){
            attendeeList.push(<ListGroup.Item key = {attendee}>{attendee}</ListGroup.Item>);
        }

        return attendeeList
    };

    const join = async (event) => {
        event.attendees.push(currentUser.email)
        let body =  {userId: currentUser.email, attendees: event.attendees};
        let newEvent = await axios.patch(
            `http://localhost:3001/schedules/${scheduleId}/${eventId}`,
            body,
            headers
        );
        // let newEvent = await axios({
        //     method: 'patch',
        //     url: '/schedules/' + scheduleId + '/' + eventId,
        //     baseURL: 'http://localhost:3001',
        //     headers: headers,
        //     data: body
        // })
        setAttending(true);
    }

    const leave = async (event) => {
        let attendeeIndex = event.attendees.findIndex(attendee => attendee == currentUser.email);
        event.attendees.splice(attendeeIndex, 1);
        let body =  {userId: currentUser.email, attendees: event.attendees};
        let newEvent = await axios.patch(
            `http://localhost:3001/schedules/${scheduleId}/${eventId}`,
            body,
            headers
        );
        // let newEvent = await axios({
        //     method: 'patch',
        //     url: '/schedules/' + scheduleId + '/' + eventId,
        //     baseURL: 'http://localhost:3001',
        //     headers: headers,
        //     data: body
        // })
        setAttending(false);
    }

    const styles = {
        // crd: {
        //     width: '25vw',
        //     height: '30vh'
        // },
        crdImg: {
            maxWidth: '25vw',
            maxHeight: '50vh'
        }
    }

    if(loading) {
        return (<p>Loading...</p>);
    }else if(error){
        return (<p>404 Page not found.</p>);
    }else {
        return (
            <div>
                {userData && userData.schedules && userData.schedules.find(id => id == scheduleId) && <Link className='nav-link' to={'/schedules/' + scheduleId + '/editEvent/' + eventId}>Edit Event</Link>}
                <Card style={styles.crd}>
                    <Card.Img variant="top" src={'http://localhost:3001/public/images/'+eventData.image} alt="event image" style={styles.crdImg}/>
                    <Card.Body>
                        <Card.Title>{eventData.name}</Card.Title>
                        <Card.Text>Description: {eventData.description}</Card.Text>
                        <Card.Text>Cost: ${eventData.cost}</Card.Text>
                        <Card.Text>Start Time: {new Date(eventData.startTime).toLocaleString()}</Card.Text>
                        <Card.Text>End Time: {new Date(eventData.endTime).toLocaleString()}</Card.Text>
                        <Button onClick={()=> setBtnToggle(!showBtnToggle)}>Show Attendees</Button>
                        {showBtnToggle &&
                            <ListGroup>Attendees:
                                {buildAttendees(eventData.attendees)}
                            </ListGroup>
                        }
                        <br/>
                        {!attending && <Button onClick={() => join(eventData)}>Join Event</Button>}
                        {attending && <Button onClick={() => leave(eventData)}>Leave Event</Button>}
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default Event;