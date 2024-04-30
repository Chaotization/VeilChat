import './friendChat.css'
import ChatRoom from './chatroom/ChatRoom.jsx';
import FriendList from './friendlist/FriendList.jsx';
import Chat from './/chat/Chat.jsx'
import AuthContext from "../AuthContext.jsx";
import { getAuth } from 'firebase/auth';
import React from 'react'
import { useUserStore } from '../../context/userStore.jsx';

export default function FriendChat() {
  
  if (isLoading) return <div className='loading'>Loading...</div>
  return (
    <div>
      <div className="container">
        <Chat/>
        <ChatRoom/>
        <FriendList/>
        </div>
    </div>
  )
}
