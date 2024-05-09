import React,{ useState , useEffect, useRef } from 'react';
import { getDatabase, ref , push , onChildAdded , onValue } from 'firebase/database';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import FriendRequestListener from "./FriendRequestListener.jsx";
import {arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import { useUserStore } from '../context/userStore.jsx';
import {db} from "../firebase/FirebaseFunctions.js";

function Chatroom(props) {
  const [messages,setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [showExitOptions, setShowExitOptions] = useState(false)
  const [chatId, setChatId] = useState('')
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false)
  const [joinChatId, setJoinChatId] = useState('')
  const [otherUserId, setOtherUserId] = useState('');
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestReceived, setFriendRequestReceived] = useState(null);
  const [isListening, setIsListening] = useState(true);
  const [promoteToFriend, setPromoteToFriend] = useState(false);
 

  const navigate = useNavigate()
  const auth = getAuth()
  const currentUser = auth.currentUser

  console.log("auth: ", auth)
  console.log("current user: ",currentUser)

  const {providedChatId} = useParams()
  //console.log("provided chat Id", providedChatId)

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const db = getDatabase();

    if (providedChatId) {
      console.log("this chatId: ",providedChatId)
      setChatId(providedChatId);
      joinChat(providedChatId);

      const participantsRef = ref(db, `chats/${providedChatId}/participants`);
      onValue(participantsRef, (snapshot) => {
        const participants = snapshot.val();
        if (participants) {
          const participantIds = [...new Set(Object.values(participants).map((participant) => participant.userId))];
          const otherParticipantId = participantIds.find((id) => id !== currentUser.uid);
          setOtherUserId(otherParticipantId);
          console.log("current user id",currentUser.uid)
          console.log("other user id",otherUserId)
        }
      });
    } else {
      createNewChat();
    }
  }, [props.chatId]);

  useEffect(()=>{
    scrollToBottom()
  },[messages])

  const generateChatId = () => {
    return 'chatId_' + Date.now() + Math.round(Math.random(0,10)*10)
  };

  const updateUserInMongoDB = async () => {
    try {
      const response = await fetch(`http://localhost:4000/login/${currentUser.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: currentUser.email }),
      });
      const result = await response.json();
      console.log('User updated in MongoDB:', result);
    } catch (error) {
      console.error('Error updating user in MongoDB:', error);
    }
  };

  const createNewChat = () => {
    const newChatId = generateChatId();
    setChatId(newChatId);
    setMessages([]);
    
    const db = getDatabase();
    const participantsRef = ref(db, `chats/${newChatId}/participants`);
    push(participantsRef, { userId: currentUser.uid, joined: true });

    updateUserInMongoDB()
  };

  const joinChat = (chatId) => {
    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatId}/messages`);

    onChildAdded(messagesRef, (snapshot) => {
      const message = snapshot.val();
      setMessages((prevMessages) => [...prevMessages, { id: snapshot.key, ...message }]);
    });

    const participantsRef = ref(db, `chats/${chatId}/participants`);
    push(participantsRef, { userId: currentUser.uid, joined: true });

    updateUserInMongoDB()
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    try {
      const result = await Storage.put(file.name, file, {
        contentType: file.type,
      });
      const imageUrl = await Storage.get(result.key);
      sendMessage(imageUrl, 'image');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const sendMessage = (content, type = 'text') => {
    const db = getDatabase();
    const messagesRef = ref(db, `chats/${chatId}/messages`);
    const newMessage = {
      content,
      type,
      timestamp: new Date().toLocaleTimeString(),
      sender: currentUser.uid,
    };
    push(messagesRef, newMessage);
    setInputText('');
  };

  const handleSendMessage = () => {
    if (inputText.trim() !== '') {
      sendMessage(inputText);
    }
  };

  const toggleFriendRequestModal = () => {
    setShowFriendRequestModal(!showFriendRequestModal);
  };

  const handleSendFriendRequest = async () => {
    try{
    const userDocRef = doc(db, "users", otherUserId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {

      await updateDoc(userDocRef, {
        friendRequests: arrayUnion({
          friendId: currentUser.uid,
          status: 'pending',
        }),
      });
    } else {
      await setDoc(userDocRef, {
        friendRequests: [{
          friendId: currentUser.uid,
          status: 'pending',
        }],
      });
    }
    setFriendRequestSent(true);
    console.log(`Friend request sent to ${otherUserId}`);
  } catch (error) {
    console.error('Error sending friend request:', error);
  }

    toggleFriendRequestModal();
  };

  const onRequestReceived = ({ requesterId }) => {
    setFriendRequestReceived(requesterId);
    console.log('A new friend request has been received.');
  };

  const onRequestAccepted = ({ requesterId }) => {
    setFriendRequestSent(false);
    setPromoteToFriend(true);
    console.log(`your friend Request to ${requesterId} was accepted!`);
  };




  const handleAcceptFriendRequest = async (requesterId) => {
    try {
      const currentUserDocRef = doc(db, 'users', currentUser.uid);
      const requesterDocRef = doc(db, 'users', requesterId);

      const currentUserDocSnap = await getDoc(currentUserDocRef);
      const requesterDocSnap = await getDoc(requesterDocRef);

      if (currentUserDocSnap.exists() && requesterDocSnap.exists()) {
        const currentUserData = currentUserDocSnap.data();
        const requesterData = requesterDocSnap.data();

        const updatedCurrentUserFriends = (currentUserData.friendRequests || []).filter(
            (friend) => !(friend.friendId === requesterId && friend.status === 'pending')
        );

        updatedCurrentUserFriends.push({ friendId: requesterId, status: 'accepted' });

        await updateDoc(currentUserDocRef, {
          friendRequests: updatedCurrentUserFriends,
        });

        await updateDoc(currentUserDocRef, {
          friends: arrayUnion(requesterId)
        });




        const updatedRequesterFriends = (requesterData.friendRequests || []).filter(
            (friend) => !(friend.friendId === currentUser.uid && friend.status === 'pending')
        );

        updatedRequesterFriends.push({ friendId: currentUser.uid, status: 'accepted' });
        await updateDoc(requesterDocRef, {
          friendRequests: updatedRequesterFriends,
        });

        await updateDoc(requesterDocRef, {
          friends: arrayUnion(currentUser.uid)
        });

        await useUserStore.getState().fetchUserInfo(currentUser.uid);
        setFriendRequestReceived(null);
        console.log(`Friend request accepted from ${requesterId}`);
        setPromoteToFriend(true);
      } else {
        console.error('User data not found');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };


  const handleRejectFriendRequest = async (requesterId) => {
    try {
      const currentUserDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserDocRef, {
        friendRequests: arrayRemove({ friendId: requesterId, status: 'pending' }),
      });

      const requesterDocRef = doc(db, 'users', requesterId);
      await updateDoc(requesterDocRef, {
        friendRequests: arrayRemove({ friendId: currentUser.uid, status: 'pending' }),
      });

      setFriendRequestReceived(null);
      console.log(`Friend request rejected from ${requesterId}`);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };




  const handleExitChat = () => {
    setShowExitOptions(true);

  };

  const handleGoToHome = async () => {
    const response = await axios.post("http://localhost:4000/search/exit", {
      userId: currentUser.uid
    })
    if(response.data.deleted){
      navigate('/home');
    }else{
      console.log(response.data.message)
    }

  };

  const handleFindNewMatch = () => {
    createNewChat();
    setShowExitOptions(false);
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // const handleJoinChat = () => {
  //   // Set the chat ID to the entered join chat ID
  //   setChatId(joinChatId);
  //   joinChat(joinChatId);
  //   setJoinChatId('');
  // };
  const openFriendRequestModal = () => {
    setShowFriendRequestModal(true);
  };





  return (
      <div className="flex justify-center items-center max-h-screen bg-base-100">
        <div className="container mx-auto p-4 bg-base-100 my-10 rounded-lg shadow-lg w-full max-w-xl flex flex-col">
          <div className="py-4 px-6 bg-primary flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
              <h2 className="text-xl font-bold text-white">Anonymous User</h2>
            </div>
            <div>

              {promoteToFriend?
                  <p className="material-symbols-outlined btn btn-primary text-white text-xl">group</p>
                  :friendRequestReceived ? (
                  <>
                    <button className="btn btn-primary" onClick={() => handleAcceptFriendRequest(friendRequestReceived)}>Accept</button>
                    <button className="btn btn-secondary" onClick={() => handleRejectFriendRequest(friendRequestReceived)}>Reject</button>
                  </>
              ) : (
                  friendRequestSent === false ? (
                      <button className="text-white" onClick={handleSendFriendRequest}>
                        <span className="material-symbols-outlined btn btn-ghost">person_add</span>
                      </button>
                  ) : (
                      <button className="material-symbols-outlined  text-xl btn btn-ghost text-white">Pending</button>
                  )
              )}
              <button className="btn btn-ghost text-white" onClick={() => setShowExitOptions(true)}>Exit</button>
            </div>
          </div>
          <div className="p-6 flex-grow h-96 overflow-y-auto">
            {messages.map((message, index) => (
                <div key={index} className={`chat ${message.sender === currentUser.uid ? 'chat-end' : 'chat-start'}`}>
                  {message.type === 'text' ? (
                      <div
                          className={`chat-bubble ${
                              message.sender === currentUser.uid ? 'chat-bubble-primary' : 'chat-bubble-secondary'
                          }`}
                      >
                        {message.content}
                        <time className="text-xs opacity-50 mt-1 block">{message.timestamp}</time>
                      </div>
                  ) : (
                      <div
                          className={`chat-image ${message.sender === currentUser.uid ? 'chat-image-end' : 'chat-image-start'}`}>
                        <img src={message.content} alt="Image" className="w-48 h-auto rounded-lg"/>
                        <time className="text-xs opacity-50 mt-1 block">{message.timestamp}</time>
                      </div>
                  )}
                </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="py-4 px-6 bg-base-100 shadow-md flex items-center mt-auto">
            <input
                type="text"
                placeholder="Type a message"
                className="input input-bordered w-full mr-4"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleEnter}
            />
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
            />
            <label htmlFor="imageUpload" className="btn btn-primary btn-outline mr-2">
              <span className="material-symbols-outlined">image</span>
            </label>
            <button className="btn btn-primary btn-outline" onClick={handleSendMessage}>
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
        {showExitOptions && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
              <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Exit Chat</h2>
                <div className="flex justify-end">
                  <button className="btn btn-primary mr-4" onClick={handleGoToHome}>
                    Go to Home
                  </button>
                  <button className="btn btn-secondary" onClick={handleFindNewMatch}>
                    Find a New Match
                  </button>
                </div>
              </div>
            </div>
        )}
        {showFriendRequestModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
              <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Send Friend Request</h2>
                <p>Do you want to send a friend request?</p>
                <div className="flex justify-end mt-4">
                  <button className="btn btn-primary mr-2" onClick={handleSendFriendRequest}>
                    Send
                  </button>
                  <button className="btn btn-secondary" onClick={toggleFriendRequestModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
        )}
        <FriendRequestListener
            isListening={isListening}
            otherUserId={otherUserId}
            onRequestReceived={onRequestReceived}
            onRequestAccepted={onRequestAccepted}
        />

      </div>
  );
}

export default Chatroom;