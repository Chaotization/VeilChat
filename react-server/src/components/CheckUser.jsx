import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AddUser from './AddUser';
import Home from './ProtectedHome';
import UserFilter from './SearchUsers';
import { useParams } from 'react-router-dom';
import {db} from '../firebase/FirebaseFunctions';
import {setDoc, doc} from 'firebase/firestore';
import FriendChat from './FriendChat/FriendChat';
function CheckUser(props) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
const url=useParams();
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check for existing user data if currentUser exists
        if (currentUser) {
          const response = await fetch("http://localhost:4000/user/userinfo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: currentUser.email }),
          });

          if (response.ok) {
            const jsonData = await response.json();
            setData(jsonData);
          } else if (response.status === 404) {
            // Handle non-existent user (potentially Google sign-in)
            if (currentUser?.providerData[0]?.providerId === 'google.com' ||currentUser?.providerData[0]?.providerId==="password") {
              try {
                const createResponse = await fetch("http://localhost:4000/user/createuserwithemail", {
                  method: "POST",
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    uId: currentUser.uid,
                    email: currentUser.email,
                  })
                });

                if (createResponse.ok) {
                  const createdData = await createResponse.json();
                  setData(createdData);
                  try{
                    const userDocRef = doc(db, "users", currentUser.uid);
                    await setDoc(userDocRef, {
                     id: currentUser.uid,
                      firstName: "",
                      lastName: "",
                      email: currentUser.email,
                      dob: "",
                      gender: "",
                      phoneNumber: "",
                      languages: [],
                      friends: [],
                      profilePictureLocation: ""
                  });
                  await setDoc(doc(db, "userchats", currentUser.uid), {
                    chats: [],
                });

                  }
                  catch(e)
                  {
                    setError("Error with firestore")
                  }
                } else {
                  setError('Failed to create user'); 
                }
              } catch (error) {
                setError(error.message); 
              }
            } 
          } else {
            setError(`Request failed`);
          }
        } else {
          navigate('/signin');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const isDataComplete = useCallback(() => {
    return data && (data.firstName || data.lastName);
  }, [data]);

  const filteredData = useMemo(() => {
    return isDataComplete() ? data : null;
  }, [data, isDataComplete]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (filteredData) {
    if(props.home)
    return <Home tested={true} firstName={filteredData.firstName} />;
    else if(props.search)
      return <UserFilter tested={true}/>
    else if(props.friendchat)
    return <FriendChat tested={true}/>

  }
  else{
  

  return <AddUser firstName={currentUser && currentUser.displayName ||"User"} redirect="/home"/>;}
}

export default CheckUser;
