import axios from 'axios';
import React, {useEffect, useRef, useState, useContext} from 'react';
import {Link, useParams} from 'react-router-dom';
import firebase from 'firebase/app';
import { getSessionToken } from '../firebase/FirebaseFunctions';
import {AuthContext} from '../firebase/Auth';
import io from 'socket.io-client';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.css';

function Chatroom(props) {
    const currentUser = useContext(AuthContext);
    const [state, setState] = useState({message: '', name: '', schedule: ''});
    const [chat, setChat] = useState([]);
    const [toggleJoin, setToggleJoin] = useState(true);
    const socketRef = useRef();
    let {scheduleId} = useParams();

    const email = firebase.auth().currentUser.email;
    const accessToken = getSessionToken();
    const headers = {headers: {
      email : email,
      accesstoken: accessToken
    }};

    // let socketio = io(`http://localhost:3001/schedules/${scheduleId}/chat`);
    
    useEffect(() => {
        console.log('On Chatroom load useEffect')
        async function fetchData() {
            try {
                const { data } = await axios.get(
                    `http://localhost:3001/schedules/${scheduleId}/chat`,
                    headers
                );
                setChat(data);
            } catch (e) {
                console.log(e);
            }
        }
        socketRef.current = io(`http://localhost:3001/schedules/${scheduleId}/chat`);
        return () => {
            console.log("HERE");
            socketRef.current.disconnect();
        };
    }, [scheduleId]);

    useEffect(() => {
        socketRef.current.on('message', ({name, message, schedule}) => {
            setChat([...chat, {name, message}]);
            async function updateLog() {
                try {
                    const { data } = await axios.patch(
                        `http://localhost:3000/schedules/${scheduleId}`,
                        chat,
                        headers
                    );
                } catch (e) {
                    console.log(e);
                }
            }
            updateLog();
        });
        socketRef.current.on('user_join', function (data) {
            setChat([
                ...chat,
                {name: 'ChatBot', message: `${data.name} has joined the chat for ${data.schedule}.`},
            ]);
        });
    }, [chat])

    const onMessageSubmit = (e) => {
        let msgEle = document.getElementById('message');
        setState({...state, [msgEle.name]: msgEle.value});
        socketRef.current.emit('message', {
            name: state.name,
            message: msgEle.value,
            schedule: state.schedule
        });
        e.preventDefault();
        setState({message: '', name: state.name, room: state.schedule});
        msgEle.value = '';
        msgEle.focus();
    };

    // useEffect(() => {
    //     socketio.on('chat', senderChats => {
    //         setChat(senderChats)
    //     })
    // });

    // function sendChatToSocket(chat){
    //     socketio.emit("chat", chat)
    // }

    // function addMessage(chat){
    //     const newChat = 
    // }
    
    const buildChat = (log) => {
        let chatLog = [];
        for (let chat of log) {
            chatLog.push(<ListGroup.Item>{chat}</ListGroup.Item>)
        }
        return chatLog
        // <div key={index}>
        //     <h4>
        //         {log.name}: <span>{log.message}</span>
        //     </h4>
        // </div>
    };
    
    const doUserJoin = ({name, room}) => {
        socketRef.current.emit('user_join', ({name, room}));
    };

    const doUserLeave = ({name, room}) => {
        socketRef.current.emit('disconnect', ({name, room}));
    }

    return (
        <div>
            <div class="content">
                <br />
                <h2>Chatroom</h2>
                {toggleJoin &&
                    <Button onClick={() => setToggleJoin(!toggleJoin)}>Join</Button>
                }
                {!toggleJoin &&
                <>
                    <Button onClick={() => setToggleJoin(!toggleJoin)}>Leave</Button>
                    <div class="container">
                        <h3 class="container-title">Log</h3>
                        {buildChat(chat)}
                    </div>
                    <form onSubmit={onMessageSubmit}>
                        <h2>Messenger</h2>
                        <div>
                            <input
                                name='message'
                                id='message'
                                variant='outlined'
                                label='Message' />
                        </div>
                        <button type='submit'>Send</button>
                    </form>
                </>  
                }
                
                
            </div>
        </div>
    )

};

export default Chatroom;