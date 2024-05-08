import React,{ useState , useEffect, useRef } from 'react';
import { getDatabase, ref , push , onChildAdded , onValue } from 'firebase/database';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

function Chatroom(props) {
  const [messages,setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [showExitOptions, setShowExitOptions] = useState(false)
  const [chatId, setChatId] = useState('')
  const [showFriendRequestModal, setShowFriendRequestModal] = useState(false)
  const [joinChatId, setJoinChatId] = useState('')
  const [otherUserId, setOtherUserId] = useState('');

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
      setChatId(providedChatId);
      joinChat(providedChatId);

      const participantsRef = ref(db, `chats/${providedChatId}/participants`);
      onValue(participantsRef, (snapshot) => {
        const participants = snapshot.val();
        if (participants) {
          const participantIds = Object.keys(participants);
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
    try {
      const response = await axios.put('http://localhost:4000/friendRequest', {
        senderId: currentUser.uid,
        receiverId: otherUserId,
      });
  
      if (response.status === 200) {
        console.log('Friend request sent successfully');
      } else {
        console.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  
    toggleFriendRequestModal();
  };

  const handleExitChat = () => {
    setShowExitOptions(true);
  };

  const handleGoToHome = () => {
    navigate('/home');
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





  return (
      <div className="flex justify-center items-center max-h-screen bg-base-100">
        <div className="container mx-auto p-4 bg-base-100 my-10 rounded-lg shadow-lg w-full max-w-xl flex flex-col">
          <div className="py-4 px-6 bg-primary flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
              <h2 className="text-xl font-bold text-white">Anonymous User</h2>
            </div>
            <div>
              <button className="text-white" onClick={handleSendFriendRequest}>
                <span className="material-symbols-outlined btn btn-ghost">person_add</span>
              </button>
              <button className="btn btn-ghost text-white" onClick={handleExitChat}>
                Exit
              </button>
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
              <div className="bg-white p-6 rounded-lg shadow-lg">
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
              <div className="bg-white p-6 rounded-lg shadow-lg">
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

      </div>
  );
}

export default Chatroom;