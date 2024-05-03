import './Chat.css'
import { AuthContext } from '../../../context/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { useUserStore } from '../../../context/userStore';
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from '../../../firebase/FirebaseFunctions';
import AddFriend from '../../addFriend/AddFriend';
import {useChatStore} from '../../../context/chatStore';

const Chat = () =>{
    const { currentUser, isLoading } = useUserStore();
    const { chatId, changeChat } = useChatStore();
    const [chats, setChats] = useState([]);
    const [searchInput, setsearchInput] = useState("");
    const [addMode, setAddMode] = useState(false);
    

    useEffect(() => {
        const unSub = onSnapshot(
          doc(db, "userchats", currentUser.id),
          async (res) => {
            const items = res.data().chats;
    
            const promises = items.map(async (item) => {
              if (!item.receiverId) {
                console.error("Missing receiver ID for item:", item);
                return null;  // Continue to the next item if this one is faulty
              }
              const userDocRef = doc(db, "users", item.receiverId);
              const userDocSnap = await getDoc(userDocRef);
    
              const user = userDocSnap.data();
    
              return { ...item, user };
            });
    
            const chatData = await Promise.all(promises);
    
            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
          }
        );
    
        return () => {
          unSub();
        };
      }, [currentUser.id]);

    if (isLoading || !currentUser) {
        return <div>Loading...</div>; 
    }
    
    const handleSelectChat = async (chat) => {
      const userChats = chats.map((item) => {
        const { user, ...rest } = item;
        return rest;
      });
  
      const chatIndex = userChats.findIndex(
        (item) => item.chatId === chat.chatId
      );
  
      userChats[chatIndex].isSeen = true;
  
      const userChatsRef = doc(db, "userchats", currentUser.id);
  
      try {
        await updateDoc(userChatsRef, {
          chats: userChats,
        });
        changeChat(chat.chatId, chat.user);
      } catch (err) {
        console.log(err);
      }
    };

    return (
        <div className="list">
        <div className='chatList'>
           <div className="userInfo">
                <img src={currentUser.profilePictureLocation || './public/imgs/avatar.png'} alt="User Avatar" className="userAvatar" />
                <div className="userName">
                    <h2>{`${currentUser.firstName} ${currentUser.lastName}`}</h2>
                </div>
          </div>
          <div className='search'>
            <div className="searchBar">
                <input type="text" placeholder='Search Chat' onChange={(e) => setsearchInput(e.target.value)} /> 
            </div>
            <img src='/imgs/plusSign.png' alt="" 
            className='add'
            onClick={() => setAddMode((prev) => !prev)}/>
          </div>
           {chats.map(chat => (
                    <div className="chatItem" key={chat.id} onClick={() => handleSelectChat(chat)}
                    style={{
                      backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
                    }}
                    >
                        <img src={chat.user.profilePictureLocation || './public/imgs/default_avatar.png'} alt={chat.user.firstName} className="avatar" />
                        <div className="chatDetails">
                            <div className="texts">
                                <span>{chat.user.firstName} {chat.user.lastName}</span>
                            </div>
                            <div className="chatBottom">
                                <p>{chat.lastMessage}</p>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
        {addMode && (
          <div className="modalOverlay">
            <div className="modalContent">
              <AddFriend />
            </div>
          </div>
        )}
        </div>
    )
}

export default Chat;