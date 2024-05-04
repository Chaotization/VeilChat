import React, { useEffect, useState } from 'react';
import './FriendList.css';
import { useUserStore } from '../../../context/userStore'; // Adjust the path as necessary
import { doc, getDoc, query, collection, where, setDoc, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc} from "firebase/firestore";
import { db } from '../../../firebase/FirebaseFunctions';
import {useChatStore} from '../../../context/chatStore';

const FriendList = ({triggerChatUpdate}) => {
  const { currentUser } = useUserStore();
  const [friends, setFriends] = useState([]);
  const { changeChat } = useChatStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    async function fetchFriendsData() {
      const promises = currentUser.friends.map(async (friendId) => {
        const docRef = doc(db, "users", friendId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
      });
      const friendsData = await Promise.all(promises);
      const sortedFriends = friendsData.filter(Boolean).sort((a, b) => {
        // Assuming the last name is stored under the key 'lastName'
        return a.lastName.localeCompare(b.lastName);
      });
      setFriends(sortedFriends);
    }
  
    if (currentUser && currentUser.friends) {
      fetchFriendsData();
    }
  }, [currentUser]);
  
  const handleSelectFriend = async (friendId) => {
    // Query to find any existing chat between the two users
    const chatsRef = collection(db, "chats");
    const firstQuery = query(chatsRef, where("members", "array-contains", currentUser.id));
    const firstQuerySnapshot = await getDocs(firstQuery);
    
    const chatsWithFriend = firstQuerySnapshot.docs.filter(doc => 
      doc.data().members.includes(friendId)
    );
  
  
    if (chatsWithFriend.length > 0) {
      // Use the first found chat document
      const chatDoc = chatsWithFriend[0];
      const chatId = chatDoc.id;
      await updateDoc(doc(db, "chats", chatId), {
        updatedAt: Date.now()
      })
      const userIDs = [currentUser.id, friendId]
      userIDs.forEach(async id => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnap = await getDoc(userChatsRef);
        if (userChatsSnap.exists()) {
          const userChatsData = userChatsSnap.data();
          const updatedChats = userChatsData.chats.map(chat => {
            if (chat.chatId === chatId) {
              return { ...chat, updatedAt: Date.now() };
            }
            return chat;
          });
          await updateDoc(userChatsRef, { chats: updatedChats });
        }
      });
      // Fetch friend's data and set the active chat
      const friendDoc = await getDoc(doc(db, "users", friendId));
      const friendData = friendDoc.data();
      changeChat(chatId, { id: friendId, ...friendData });
      triggerChatUpdate(); 
    } else {
      // Create a new chat if it does not exist
      const newChatRef = doc(collection(db, "chats"));
      await setDoc(newChatRef, {
        members: [currentUser.id, friendId],
        messages: []
      });
      const chatId = newChatRef.id;
  
      // Add new chat to each user's 'userchats'
      const userIDs = [currentUser.id, friendId];
      userIDs.forEach(async id => {
        const userChatRef = doc(db, "userchats", id);
        await updateDoc(userChatRef, {
          chats: arrayUnion({
            chatId: chatId,
            receiverId: id === currentUser.id ? friendId : currentUser.id,
            lastMessage: "",
            updatedAt: Date.now()
          })
        });
      });
    }
  };
  
  
  const handleDeleteFriend = async () => {
    const userRef = doc(db, "users", currentUser.id);
    const friendRef = doc(db, "users", selectedFriend.id);

    
    await updateDoc(userRef, {
      friends: arrayRemove(selectedFriend.id)
    });
    await updateDoc(friendRef, {
      friends: arrayRemove(currentUser.id)
    });
   
    const userChatRef = doc(db, "userchats", currentUser.id);
    const userChatSnapshot = await getDoc(userChatRef);
    const userChatData = userChatSnapshot.data();
    const userFdata = userChatData.chats.find(chat => chat.receiverId === selectedFriend.id);
    const userchatDRef = doc(db, "chats", userFdata.id)
    const userChatDocRef = doc(db, "userchats", "currentUser.id");
    
    try {
      await updateDoc(userChatDocRef,{
        chats: arrayRemove(userFdata)
      } );
    } catch (error) {
      console.error("Error deleting document:", error);
    }
    try {
      await deleteDoc(userchatDRef);
    } catch (e){
      console.log(e)
    }
    const friendChatRef = doc(db, "userchats", selectedFriend.id);
    const friendChatSnapshot = await getDoc(friendChatRef);
    const friendChatData = friendChatSnapshot.data();
    const FriendFdata = friendChatData.chats.find(chat => chat.receiverId === currentUser.id);
    const friendChatDocRef = doc(db, "userchats", selectedFriend.id);
    try {
      await updateDoc(friendChatDocRef,{
        chats: arrayRemove(FriendFdata)
      } );
    } catch (error) {
      console.error("Error deleting document:", error);
    }

    
    
    setShowConfirm(false);
    setFriends(friends.filter(friend => friend.id !== selectedFriend.id));
  };

  return (
    <div className="friendList">
      <div className='search'>
        <div className="searchbar">
          <input type="text" placeholder='Search Friend' />
        </div>
      </div>
      {friends.map(friend => (
        <div key={friend.id} className="item" onClick={() => handleSelectFriend(friend.id)}>
          <img src={friend.profilePictureLocation || './public/imgs/default_avatar.png'} alt={friend.firstName} />
          <div className='texts'>
            <span>{friend.firstName} {friend.lastName}</span>
            <img src="./imgs/option.png" alt="Options" onClick={() => { setShowConfirm(true); setSelectedFriend(friend); }} />
          </div>
        </div>
      ))}
      {showConfirm && (
        <div className="confirmDialog">
          <p>Are you sure you want to delete {selectedFriend.firstName} {selectedFriend.lastName}?</p>
          <img src={selectedFriend.profilePictureLocation || './public/imgs/default_avatar.png'} alt={selectedFriend.firstName} />
          <button onClick={handleDeleteFriend}>Delete</button>
          <button onClick={() => setShowConfirm(false)}>Cancel</button>
    </div>
      )}
      </div>
  );
};

export default FriendList;
