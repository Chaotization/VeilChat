import React, { useEffect, useState } from 'react';
import './FriendList.css';
import { useUserStore } from '../../../context/userStore'; // Adjust the path as necessary
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../../firebase/FirebaseFunctions';

const FriendList = () => {
  const { currentUser } = useUserStore();
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    async function fetchFriendsData() {
      const promises = currentUser.friends.map(async (friendId) => {
        const docRef = doc(db, "users", friendId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
      });
      const friendsData = await Promise.all(promises);
      setFriends(friendsData.filter(Boolean)); // Filter out any null results
    }

    if (currentUser && currentUser.friends) {
      fetchFriendsData();
    }
  }, [currentUser]);

  return (
    <div className="friendList">
      <div className='search'>
        <div className="searchbar">
          <input type="text" placeholder='Search Friend' />
        </div>
      </div>
      {friends.map(friend => (
        <div key={friend.id} className="item">
          <img src={friend.profilePictureLocation || './public/imgs/default_avatar.png'} alt={friend.firstName} />
          <div className='texts'>
            <span>{friend.firstName} {friend.lastName}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendList;
