import React, {useState, useEffect, useContext} from 'react';
import '../App.css';
import {useParams, useNavigate} from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import {AuthContext} from '../firebase/Auth';
import { getSessionToken } from '../firebase/FirebaseFunctions';
import { checkString, checkCost, checkDate } from '../validation.js';

function CreateEvent({handler}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [customError, setCustomError] = useState(undefined);
  const [scheduleData, setScheduleData] = useState(undefined);
  const [validated, setValidated] = useState(false);
  const {currentUser} = useContext(AuthContext);
  const accessToken = getSessionToken();
  var headers = {headers: {
    email : currentUser.email,
    accesstoken: accessToken,
    'Access-Control-Allow-Origin':'*'
  }};  
  const navigate = useNavigate();
  let {scheduleId} = useParams();

  useEffect(() => {
    console.log('on load useEffect');
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);
        const { data } = await axios.get('http://localhost:3001/schedules/' + scheduleId, headers);
        setScheduleData(data);
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


    if (form.checkValidity() === false) {
      e.stopPropagation();
      flag = false;
    }else {
      try{
        name = checkString(form.name.value, 'Name');
        for (let event of scheduleData.events) {
          if (event.name == name) throw 'Error: Cannot have two events with the same name';
        }
        description = checkString(form.description.value, 'Description');
        cost = checkCost(form.cost.value, 'Cost');
        startTime = new Date(form.startTime.value);
        startTime = checkDate(startTime, 'Start Time');
        endTime = new Date(form.endTime.value);
        endTime = checkDate(endTime, 'End Time');
        if (endTime.getTime() <= startTime.getTime()) throw 'Error: End time cannot happen before or at the same time as start time';
      }catch(e) {
        flag = false;
        setCustomError(e);
      }
    }

    if (flag === true){
      let form_data =  new FormData();
      let file = form.image.files[0]
      let body = {
        userId: currentUser.email,
        name: name,
        description: description,
        cost: cost,
        startTime: startTime.getTime(),
        endTime: endTime.getTime()
      }; 

      for (let key in body) {
        form_data.append(key, body[key]);
      }

      form_data.append('file', file);

      headers['Content-Type'] = 'multipart/form-data';

      try {
        let newEvent = await axios.post(
          `http://localhost:3001/schedules/${scheduleId}/createEvent`,
          form_data,
          headers
        )
        handler();
        // let newEvent = await axios({
        //   method: 'post',
        //   url: '/schedules/' + scheduleId + '/createEvent',
        //   baseURL: 'http://localhost:3001',
        //   headers: headers,
        //   data: form_data
        // })
        navigate('/schedules/' + scheduleId);
      }catch(e) {
        console.log(e)
        setCustomError(e.response.statusText);
      }

    }

    setValidated(true);
  };

    if(loading) {
      return (<p>Loading...</p>)
    }else if(error) {
      return (<p>404 Page not found.</p>);
    }else {
      return (
        <div>
          <p>Create Event</p>
          {customError && <p variant='warning'>{customError}</p>}
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                required
                type="text" 
                placeholder="Enter name"
              />
              <Form.Control.Feedback type="invalid">
                Please enter a name.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                required 
                as="textarea" 
                rows={3} 
                placeholder="Enter description" 
              />   
              <Form.Control.Feedback type="invalid">
                Please enter a description.
              </Form.Control.Feedback>
             </Form.Group>

            <Form.Group className="mb-3" controlId="cost">
              <Form.Label>Cost</Form.Label>
              <Form.Control required type="number" placeholder="Enter cost" />
              <Form.Control.Feedback type="invalid">
                Please enter a cost.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="startTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control required type="datetime-local" placeholder="Enter start time" />
              <Form.Control.Feedback type="invalid">
                Please enter a start time.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="endTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control required type="datetime-local" placeholder="Enter end time" />
              <Form.Control.Feedback type="invalid">
                Please enter a end time.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="image">
              <Form.Label>Image</Form.Label>
              <Form.Control required type="file" placeholder="Image" />
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
        </div>
      )
    }
}

export default CreateEvent;