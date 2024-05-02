import { useState } from "react";
import { db } from '../../firebase/FirebaseFunctions';
import {
  arrayUnion,
  doc,
  query,
  getDocs,
  collection,
  where,
  updateDoc,
} from "firebase/firestore";
import { useUserStore } from "../../context/userStore";



const AddFriend = () => {
  const [friend, setFriend] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const firstName = formData.get("firstName").trim().toLowerCase();
    const lastName = formData.get("lastName").trim().toLowerCase();

    
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

    const userChatsRefCurrentUser = doc(db, "userchats", currentUser.id);
    const userChatsRefFriend = doc(db, "userchats", friend.id);

    try {
      // Update current user's chat list
      await updateDoc(userChatsRefCurrentUser, {
        chats: arrayUnion({
          chatId: friend.id,  // Using friend's ID as chatId for simplicity
          lastMessage: "",
          receiverId: friend.id,
          updatedAt: new Date(),
        }),
      });

      // Update friend's chat list
      await updateDoc(userChatsRefFriend, {
        chats: arrayUnion({
          chatId: currentUser.id,  // Using current user's ID as chatId for simplicity
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: new Date(),
        }),
      });
    } catch (error) {
      console.error("Error adding friend:", error);
    }
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
