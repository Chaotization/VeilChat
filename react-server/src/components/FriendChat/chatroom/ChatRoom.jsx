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
    name: null
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
        name: file.name
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

  const checkUserStatus = async () => {
    let receiverId = getReceiverId(chatId)
    // const response = await axios.post('http://localhost:4000/user/checkstatus')
    // if(response)

  }

  const handleSend = async () => {
  
    if (!text.trim() && !file.file) {
      console.log("No content to send.");
      return;
    }
    let fileName = null;
    let fileUrl = null;
    let fileType = null;
    try {
      if (file.file) {
        console.log("Uploading file...");
        fileUrl = await upload(file.file);
        fileType = file.file.type;
        fileName = file.name,
        console.log("File uploaded:", fileUrl);
      }
  
      const messageData = {
        senderId: currentUser.id,
        text:text.trim(),
        createdAt: Date.now(),
        ...(fileUrl && { fileUrl, fileType, fileName }),

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
      setfile({ file: null, url: "", name: null });
      setText("");
    }
  };

  const FileMessage = ({ message }) => {
    const { fileType, fileUrl, fileName } = message;
  
    const fileExtension = fileType?.split('/').pop();
  
    const handleClick = () => {
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileUrl.split('/').pop(); 
      link.click();
    };
  
    if (fileType?.startsWith('image')) {
      return <img src={fileUrl} alt="Sent Image" className="w-full mb-2 rounded-lg" />;
    } else if (fileType?.startsWith('video')) {
      return <video src={fileUrl} controls className="w-full mb-2 rounded-lg"></video>;
    } else if (fileType?.startsWith('audio')) {
      return <audio controls src={fileUrl} className="w-full mb-2"></audio>;
    } else {
      // Display a generic file icon for other file types
      return (
        <div onClick={handleClick} className="cursor-pointer flex items-center space-x-2">
          <img src="/imgs/file.png" alt="File" className="w-6 h-6" />
          <span>Download: {fileName|| 'Unknown File'}</span>
        </div>
      );
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
              {message.fileUrl && <FileMessage message={message} />}
              {message.text && <p>{message.text}</p>}
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
      <div className="bottom flex items-center mt-4 space-x-2">
    <input type="text" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} className="input input-bordered flex-grow mr-2" />
    <label htmlFor="file" className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <img src="imgs/file.png" alt="Upload" className="h-5 w-5" />  
    </label>
    <input type="file" id="file" className="hidden" onChange={handleFileUpload} />
    <button className="btn btn-primary" onClick={handleSend}>Send</button>
    {file.url && (
        <div className="preview bg-green-200 p-2 rounded flex items-center">
            <p className="mr-2">{file.name}</p> {/* Display the name of the file here */}
            <button onClick={() => setfile({ file: null, url: "", name: "" })} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                Remove
            </button>
        </div>
    )}
</div>
    </div>
  )
}

export default ChatRoom
