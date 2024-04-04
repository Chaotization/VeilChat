import React,{useState, useContext, useEffect} from 'react';
import axios from 'axios';
import '../App.css';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { useParams } from 'react-router-dom';
import {AuthContext} from '../firebase/Auth';
import firebase from 'firebase/app';
import { getSessionToken } from '../firebase/FirebaseFunctions';
import 'bootstrap/dist/css/bootstrap.css';
import InviteForm from './Forms/InviteForm'

function InvitedUsers() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [invBtnToggle, setInvBtnToggle] = useState(false);
    const [userData, setUserData] = useState(undefined);
    const {currentUser} = useContext(AuthContext);
    const params = useParams();
    let list = null;

    const email = firebase.auth().currentUser.email;
    const accessToken = getSessionToken();
    const headers = {headers: {
        email : email,
        accesstoken: accessToken,
        'Access-Control-Allow-Origin':'*'
    }};

    useEffect(() => {
        console.log('on load useEffect');
        async function fetchData() {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `http://localhost:3001/schedules/${params.scheduleId}/invite`,
                    headers
                );
                setUserData(data);
                setLoading(false);
            } catch (e) {
                setError(true);
                setLoading(false);
                console.log(e);
            }
        };
        fetchData();
    }, [params.scheduleId])

    const buildAttendees = (attendees) => {
        let attendeeList = [];
        for (let attendee of attendees){
            attendeeList.push(<ListGroup.Item key = {attendee}>{attendee}</ListGroup.Item>);
        }

        return attendeeList
    };

    if (loading) {
        return (
            <div>
                <h2>Loading. . . .</h2>
            </div>
        );
    } else if (error) {
        console.log(error);
        return (
            <div>
                <h2>404 Page Not Found.</h2>
            </div>
        );
    } else {
        return (
            <div className="content">
                <br />
                <h1>Invited Users</h1>
                <Button onClick={() => setInvBtnToggle(!invBtnToggle)}>Invite User</Button>
                {invBtnToggle && <InviteForm />}
                <br />
                <br />
                <ListGroup>Users:
                    {buildAttendees(userData)}
                </ListGroup>
            </div>
        )
    }
}

export default InvitedUsers;