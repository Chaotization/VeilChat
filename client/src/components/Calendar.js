import React, {useState, useEffect, useContext} from 'react';
import '../App.css';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { getSessionToken } from '../firebase/FirebaseFunctions';
import {AuthContext} from '../firebase/Auth';

function Calendar() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [scheduleData, setScheduleData] = useState(undefined);
    const [myEvents, setEvents] = useState(undefined);
    const {currentUser} = useContext(AuthContext);
    const accessToken = getSessionToken();
    const headers = {headers: {
      email : currentUser.email,
      accesstoken: accessToken,
      'Access-Control-Allow-Origin':'*'
    }};
    const navigate = useNavigate();
    let {scheduleId} = useParams();

    const formatEvents = (events) => {
      let eventList = []
      let minDate = events[0].startTime
      console.log('minDate: ' + minDate)
      for (let event of events) {
        minDate = minDate < event.startTime ? minDate : event.startTime;

        eventList.push({
          title: event.name,
          start: new Date(event.startTime),
          end: new Date(event.endTime),
          url: '/schedules/' + scheduleId + '/event/'+ event.name
        });
      }

      let eventsObject = {
        minDate: minDate,
        events: eventList
      }

      return eventsObject;
    };

    useEffect(() => {
      console.log('on load useEffect');
      async function fetchData() {
        try {
          setLoading(true);
          setError(false);
          const { data } = await axios.get('http://localhost:3001/schedules/' + scheduleId, headers);
          setScheduleData(data);
          const events = data.events.length > 0 ? formatEvents(data.events) : {minDate: new Date(), events:[]};
          setEvents(events);
          setLoading(false);
        } catch (e) {
          setError(true);
          setLoading(false);
          console.log(e);
        }
      };
      fetchData();
    }, [scheduleId]);


    const eventClickHandler = (info) => {
      navigate(info.event.url)
    }

    if(loading) {
      return (<p>Loading...</p>);
    }else if(error){
      return (<p>404 Page not found.</p>);
    }else {
      return (
        <FullCalendar
          plugins={[ dayGridPlugin ]}
          initialView="dayGridMonth"
          events={myEvents.events}
          initialDate={myEvents.minDate}
          eventClick={eventClickHandler}
        />
      ); 
    }
}

export default Calendar;