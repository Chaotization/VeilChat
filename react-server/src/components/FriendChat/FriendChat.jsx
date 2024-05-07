import './friendChat.css'
import ChatRoom from './chatroom/ChatRoom.jsx';
import FriendList from './friendlist/FriendList.jsx';
import Chat from './chat/Chat.jsx';  // Removed additional slash
import AuthContext from "../AuthContext.jsx";
import { getAuth } from 'firebase/auth';
import React, { useState } from 'react'  // Corrected import order for React and useState
import { useUserStore } from '../../context/userStore.jsx';
import { useChatStore } from '../../context/chatStore.jsx';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
export default function FriendChat() {
  const [updateTrigger, setUpdateTrigger] = useState(0);
  let auth=getAuth();
  let currentUser=auth.currentUser;
  const navigate = useNavigate();
  useEffect(()=>{
    if(!currentUser)
    {
      navigate('/signin')
      return
    }
  },[])
  const triggerChatUpdate = () => {
    setUpdateTrigger(current => current + 1); // Increment to force update
  };
  const {chatId} = useChatStore();

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-3 gap-4">
        <Chat />
        <ChatRoom />
        <FriendList triggerChatUpdate={triggerChatUpdate} />
      </div>
    </div>
  )
}
