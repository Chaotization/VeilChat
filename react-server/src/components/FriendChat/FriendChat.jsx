import './friendChat.css'
import ChatRoom from './chatroom/ChatRoom.jsx';
import FriendList from './friendlist/FriendList.jsx';
import Chat from './chat/Chat.jsx';  // Removed additional slash
import AuthContext from "../AuthContext.jsx";
import { getAuth } from 'firebase/auth';
import React, { useState } from 'react'  // Corrected import order for React and useState
import { useUserStore } from '../../context/userStore.jsx';
import { useChatStore } from '../../context/chatStore.jsx';

export default function FriendChat() {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const triggerChatUpdate = () => {
    setUpdateTrigger(current => current + 1); // Increment to force update
  };
  const {chatId} = useChatStore();

  return (
    <div>
      <div className="container">
        <Chat/>
        <ChatRoom/>
        <FriendList triggerChatUpdate={triggerChatUpdate}/>  // Passing triggerChatUpdate here
      </div>
    </div>
  )
}
