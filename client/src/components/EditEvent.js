import React, {useState, useEffect, useContext} from 'react';
import '../App.css';
import {useParams, useNavigate} from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import {AuthContext} from '../firebase/Auth';
import { getSessionToken } from '../firebase/FirebaseFunctions';
import { checkString, checkCost, checkDate } from '../validation.js';

function EditEvent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [customError, setCustomError] = useState(undefined);
  const [scheduleData, setScheduleData] = useState(undefined);
  const [eventData, setEventData] = useState(undefined)
  const [validated, setValidated] = useState(false);
  const {currentUser} = useContext(AuthContext);
  const accessToken = getSessionToken();
  var headers = {headers: {
    email : currentUser.email,
    accesstoken: accessToken,
    'Access-Control-Allow-Origin':'*'
  }};  const navigate = useNavigate();
  let {scheduleId, eventId} = useParams();


  useEffect(() => {
    console.log('on load useEffect');
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);
        const { data } = await axios.get('http://localhost:3001/schedules/' + scheduleId, headers);
        setScheduleData(data);
        setEventData(data.events.find(event => event.name == eventId));
        setLoading(false);
      } catch (e) {
        setError(true);
        setLoading(false);
        console.log(e);
      }
    };
    fetchData();
  }, [scheduleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomError(undefined)
    const form = e.currentTarget;
    let flag = true;
    let name;
    let description;
    let cost;
    let startTime;
    let endTime;

    try{
      if (form.name.value) {
        name = checkString(form.name.value, 'Name');
        for (let event of scheduleData.events) {
          if (event.name == name) throw 'Error: Cannot have two events with the same name';
        }
      }
      if (form.description.value) description = checkString(form.description.value, 'Description');
      if (form.cost.value) cost = checkCost(form.cost.value, 'Cost');
      if (form.startTime.value) {
        startTime = new Date(form.startTime.value);
        startTime = checkDate(startTime, 'Start Time');
        startTime = startTime.getTime();
      }
      if (form.endTime.value) {
        endTime = new Date(form.endTime.value);
        endTime = checkDate(endTime, 'End Time');
        endTime = endTime.getTime();
      }
      if (form.startTime.value && form.endTime.value && endTime <= startTime) throw 'Error: End time cannot happen before or at the same time as start time';
      if (form.startTime.value && !form.endTime.value && eventData.endTime <= startTime) throw 'Error: End time cannot happen before or at the same time as start time';
      if (!form.startTime.value && form.endTime.value && endTime <= eventData.startTime) throw 'Error: End time cannot happen before or at the same time as start time';
    }catch(e) {
      flag = false;
      setCustomError(e);
    }

    if (flag === true){
      let form_data =  new FormData();
      let file = form.image.files[0]
      let body = {
        userId: currentUser.email,
        name: name,
        description: description,
        cost: cost,
        startTime: startTime,
        endTime: endTime
      }; 

      for (let key in body) {
        form_data.append(key, body[key]);
      }

      form_data.append('file', file);

      headers['Content-Type'] = 'multipart/form-data';

      try {
        let newEvent = await axios({
          method: 'patch',
          url: '/schedules/' + scheduleId + '/' + eventId,
          baseURL: 'http://localhost:3001',
          headers: headers,
          data: form_data
        })

        navigate('/schedules/' + scheduleId + '/event/' + eventId);
      }catch(e) {
        setCustomError(e.response.statusText);
      }
    }

    setValidated(true);
  };

  const styles = {
    image: {
        maxWidth: '25vw',
        maxHeight: '50vh'
    }
}
    if(loading) {
      return (<p>Loading...</p>)
    }else if(error) {
      return (<p>404 Page not found.</p>);
    }else {
      return (
        <div>
          <h2>Edit Event</h2>
          {customError && <p>{customError}</p>}
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder={eventData.name}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea" 
                rows={3} 
                placeholder={eventData.description}
              />   
             </Form.Group>

            <Form.Group className="mb-3" controlId="cost">
              <Form.Label>Cost</Form.Label>
              <Form.Control type="number" placeholder={eventData.cost} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="startTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control type="datetime-local" placeholder={eventData.startTime} />
              <Form.Text className="text-muted">
                Current: {new Date(eventData.startTime).toLocaleString()}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="endTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control type="datetime-local" placeholder={eventData.endTime} />
              <Form.Text className="text-muted">
                Current: {new Date(eventData.endTime).toLocaleString()}
              </Form.Text>
            </Form.Group>

            <img src={'http://localhost:3001/public/images/'+eventData.image} alt='event image' style={styles.image}></img>
            <Form.Group className="mb-3" controlId="image">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" placeholder="Image" />
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      )
    }
}

export default EditEvent;