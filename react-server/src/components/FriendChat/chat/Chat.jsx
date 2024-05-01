import './Chat.css'
import { AuthContext } from '../../../context/AuthContext';
import { useContext, useEffect, useState } from 'react';
import { useUserStore } from '../../../context/userStore';
import { doc, onSnapshot } from "firebase/firestore"
import { db } from '../../../firebase/FirebaseFunctions';

const Chat = () =>{
    const { currentUser, isLoading } = useUserStore();
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const unSub = onSnapshot(
          doc(db, "userchats", currentUser.id),
          async (res) => {
            const items = res.data().chats;
    
            const promises = items.map(async (item) => {
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
    

    return (
        <div className="list">
        {/*user information here */}
        <div className='chatList'>
           <div className='search'>
            <div className="searchbar">
                <img src = "" alt="" />
                <input type = "text" placeholder='Search Chat' />
            </div>
           </div>
           <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Su Zhang</span>
                <p>I am the last message</p>
            </div>
            </div>
           <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Su Zhang</span>
                <p>I am the last message</p>
            </div>
            </div>
           <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Su Zhang</span>
                <p>I am the last message</p>
            </div>
            </div>
           <div className="item">
            <img src='./public/imgs/avatar.png' alt='' />
            <div className='texts'>
                <span>Su Zhang</span>
                <p>I am the last message</p>
            </div>
           </div>
        </div>
        </div>
    )
}

export default Chat;