import React, {useEffect, useRef, useState} from 'react'
import {arrayUnion, doc, getDoc, onSnapshot, updateDoc} from "firebase/firestore";
import {db} from '../../../firebase/FirebaseFunctions';
import {useChatStore} from '../../../context/chatStore';
import {useUserStore} from '../../../context/userStore';
import upload from '../../../context/upload';
import moment from 'moment';
import axios from "axios";

const ChatRoom = () =>{
  const timeAgo = (createdAt) => {
    return moment(createdAt).fromNow();
  }
  const [chat, setChat] = useState();
  const endRef = useRef(null)
  const { chatId, user } = useChatStore();
  const {currentUser} = useUserStore();
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);
  const handleIconClick = () => {
    fileInputRef.current.click();
  };
  const [file, setfile] = useState({
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setfile({
        file,
        url,
      });
    }
  };
  

  const getReceiverId = async (chatId) => {
    try {
      const chatRef = doc(db, "chats", chatId);

      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const receiverId = chatData.members.find(memberId => memberId !== currentUser.uid);
        return receiverId;
      } else {
        console.log("Chat document does not exist.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching chat document:", error);
      return null;
    }
  };

  // const checkUserStatus = async () => {
  //   let receiverId = getReceiverId(chatId)
  //   const response = await axios.post('http://localhost:4000/user/checkstatus')
  //   if(response)
  //
  // }

  const handleSend = async () => {
  
    if (!text.trim() && !img.file) {
      console.log("No content to send.");
      return;
    }
  
    let fileUrl = null;
    try {
      if (file.file) {
        console.log("Uploading file...");
        fileUrl = await upload(file.file);
        console.log("Image uploaded:", fileUrl);
      }
  
      const messageData = {
        senderId: currentUser.id,
        text,
        createdAt: Date.now(),
        ...(fileUrl && { img: fileUrl }),

      };
  
      
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(messageData),
      });
  
      
      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
  
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
  
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
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
      setfile({ file: null, url: "" });
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
    <div className="chat bg-white shadow-md rounded-lg p-4">
      <div className="top flex items-center mb-4">
        <div className="user flex items-center">
          <img src={user?.profilePictureLocation || "/imgs/avatar.png"} alt="" className="w-12 h-12 rounded-full mr-4" />
          <div className="texts">
            <span className="font-bold">{user?.firstName} {user?.lastName}</span>
          </div>
        </div>
      </div>
      <div className="center overflow-y-auto max-h-80">
        {chat?.messages?.map(message => (
          <div
            className={`message ${message.senderId === currentUser?.id ? 'own bg-primary text-white' : 'bg-gray-200'} rounded-lg p-2 mb-2`}
            key={message?.creatAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" className="w-full mb-2 rounded-lg" />}
              <p>{message.text}</p>
              <span>{timeAgo(message.createdAt)}</span>
            </div>
          </div>
        ))}
        {file.url && (
          <div className="message own bg-primary text-white rounded-lg p-2 mb-2">
            <div className="texts">
              <img src={file.url} alt="" className="w-full mb-2 rounded-lg" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom flex items-center mt-4">
        <div className="">
          <label htmlFor="file">
          <img src="imgs/file.png" alt="" />
            </label>
            <input type="file" id="file" style={{display: "none"}} onChange={handleFileUpload} />
        </div>
        <input type="text" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} className="input input-bordered flex-grow mr-2" />
        <button className="sendButton btn btn-primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  )
}

export default ChatRoom
