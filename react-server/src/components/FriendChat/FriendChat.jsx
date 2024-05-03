import './friendChat.css'
import ChatRoom from './chatroom/ChatRoom.jsx';
import FriendList from './friendlist/FriendList.jsx';
import Chat from './/chat/Chat.jsx'
import AuthContext from "../AuthContext.jsx";
import { getAuth } from 'firebase/auth';
import React from 'react'
import { useUserStore } from '../../context/userStore.jsx';
import { useChatStore } from '../../context/chatStore.jsx';

export default function FriendChat() {
  
  const {chatId} = useChatStore();

  return (
    <div>
      <div className="container">
        <Chat/>
        <ChatRoom/>
        {/* {chatId && <ChatRoom/>} */}
        <FriendList/>
        </div>
    </div>
  )
}
