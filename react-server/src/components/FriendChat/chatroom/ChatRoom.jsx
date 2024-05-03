import React, { useEffect, useRef, useState } from 'react'
import './ChatRoom.css'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc} from "firebase/firestore";
import { db } from '../../../firebase/FirebaseFunctions';
import {useChatStore} from '../../../context/chatStore';
import { useUserStore } from '../../../context/userStore';
import upload from '../../../context/upload';

const ChatRoom = () =>{

  const [chat, setChat] = useState();
  const endRef = useRef(null)
  const { chatId, user } = useChatStore();
  const {currentUser} = useUserStore();
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  useEffect(()=>{
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(()=>{
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res)=>{
      setChat(res.data())
    })

    return ()=>{
      unSub();
    }
  }, [chatId])
  
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    console.log("Sending message:", { text, img });
  
    if (!text.trim() && !img.file) {
      console.log("No content to send.");
      return;
    }
  
    let imgUrl = null;
    try {
      if (img.file) {
        console.log("Uploading image...");
        imgUrl = await upload(img.file);
        console.log("Image uploaded:", imgUrl);
      }
  
      const messageData = {
        senderId: currentUser.id,
        text,
        createdAt: new Date(),  // Consider using Firestore serverTimestamp here
        ...(imgUrl && { img: imgUrl }),
      };
  
      console.log("Updating chat document...");
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(messageData),
      });
  
      console.log("Updating user chats...");
      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
  
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
  
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].updatedAt = new Date();
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
  
            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setImg({ file: null, url: "" });
      setText("");
    }
  };
  

  if (!chatId) {
    return (
      <div className="chat">
        <div className="placeholder">
          <p>Please select a chat to begin.</p>
        </div>
      </div>
    );
  }

  return (
      <div className="chat">
        <div className="top">
          <div className="user">
            <img src = {user?.profilePictureLocation  || "/imgs/avatar.png"} alt="" />
            <div className='texts'>
            <span>{user?.firstName}  {user?.lastName}</span>
            </div>
          </div>
        </div>
        <div className="center">
          {chat?.messages?.map(message=>(
            <div className={
              message.senderId === currentUser?.id ? "message own" : "message"
            } key = {message?.creatAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              {/* <span>{format(message.createdAt.toDate())}</span> */}
            </div>
          </div>
          ))}
          {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
          {/* Auto scroll down to last message */}
          <div ref={endRef}></div>
        </div>
        <div className="bottom">
          <div className="icons"></div>
          <input type = 'text' placeholder='Type a message...' value={text} onChange={(e) => setText(e.target.value)}/>
          <button className='sendButton' onClick={handleSend}>Send</button>
        </div>
      </div>
  )
}

export default ChatRoom
