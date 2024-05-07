import { useState } from "react";
import { db } from '../../firebase/FirebaseFunctions';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useUserStore } from "../../context/userStore";


const AddFriend = () => {
  const [friend, setFriend] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const firstName = formData.get("firstName").trim()
    const lastName = formData.get("lastName").trim()

    
    const userRef = collection(db, "users");
    // Query using both first and last names
    const q = query(userRef, where("firstName", "==", firstName), where("lastName", "==", lastName));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setFriend(querySnapshot.docs[0].data());
      } else {
        console.log("No user found with the specified name");
      }
    } catch (error) {
      console.error("Error searching user:", error);
    }
  };

  const handleAddFriend = async () => {
    if (!friend) return;

    // Creating a new chat document in the chats collection
    const chatRef = collection(db, "chats");
    const newChatRef = doc(chatRef);

    // Create a new chat document with initial settings
    await setDoc(newChatRef, {
      createdAt: serverTimestamp(),
      messages: [],
      members: [currentUser.id, friend.id], // Both users are members of this chat
      updatedAt: serverTimestamp(),
      lastMessage: ""
    });

    // User chats reference for both users
    const userChatsRefCurrentUser = doc(db, "userchats", currentUser.id);
    const userChatsRefFriend = doc(db, "userchats", friend.id);

    // Update chat lists for both users
    const chatInfo = {
      chatId: newChatRef.id,
      lastMessage: "",
      updatedAt: new Date(),
    };

    await updateDoc(userChatsRefCurrentUser, {
      chats: arrayUnion({...chatInfo, receiverId: friend.id}),
    });

    await updateDoc(userChatsRefFriend, {
      chats: arrayUnion({...chatInfo, receiverId: currentUser.id}),
    });

    // Update the friends list for both users
    const currentUserRef = doc(db, "users", currentUser.id);
    const friendRef = doc(db, "users", friend.id);

    await updateDoc(currentUserRef, {
      friends: arrayUnion(friend.id)
    });

    await updateDoc(friendRef, {
      friends: arrayUnion(currentUser.id)
    });
};



  return (
    <div className="addFriend">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Friend's first name" name="firstName" />
        <input type="text" placeholder="Friend's last name" name="lastName" />
        <button type="submit">Search</button>
      </form>
      {friend && (
        <div className="friend">
          <div className="detail">
            <img src={friend.profilePictureLocation || "./avatar.png"} alt={`${friend.firstName} ${friend.lastName}`} />
            <span>{`${friend.firstName} ${friend.lastName}`}</span>
            <button onClick={handleAddFriend}>Add Friend</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFriend;
