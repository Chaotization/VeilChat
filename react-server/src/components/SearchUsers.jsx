import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const UserFilter = () => {
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [language, setLanguage] = useState('');
    const [distance, setDistance] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [locationAccessDenied, setLocationAccessDenied] = useState(false);
    const [filteredUser, setFilteredUser] = useState([]);
    
    //firebase
    const [messages,setMessagessetMessages] = useState([])
    const [chatId, setChatId] = useState('')
    const navigate = useNavigate();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const handleLocationAccess = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    console.log('Location access granted. User coordinates:', latitude, longitude);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                    setLocationAccessDenied(true);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const handleFilter = async () => {
        try {
            const response = await axios.post('http://localhost:4000/search', {
                _id: "662963e613e649c284e1e509",
                gender,
                age,
                language,
                distance,
                userLocation,
               });

            setFilteredUser(response.data);
            console.log(filteredUser[0]._id.toString());
        } catch (error) {
            console.error('Error filtering users:', error);
        }
    };

    const handleDistanceChange = (e) => {
        const selectedDistance = e.target.value;
        setDistance(selectedDistance);

        if (selectedDistance !== '') {
            handleLocationAccess();
        }
    };


    //firebase
    const generateChatId = () => {
        return 'chatId_' + Date.now() + Math.round(Math.random(0,10)*10)
    };
    
    const createNewChat = () => {
        const newChatId = generateChatId();
        setChatId(newChatId);
        setMessages([]);
        const db = getDatabase();
        const participantsRef = ref(db, `chats/${newChatId}/participants`);
        push(participantsRef, { userId: currentUser.uid, joined: true });
    
        navigate(`/chat/${newChatId}`)
    };
    
    const handleChatRedirect = () => {
        console.log("inside chat redirect")
        createNewChat()
    }

    

    return (
      <div className="bg-base-200 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">User Filter</h2>
        <div className="mb-4">
          <label className="block mb-2 font-bold">Gender:</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-bold">Age:</label>
          <select
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select Age Range</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-45">36-45</option>
            <option value="46-55">46-55</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-bold">Languages:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">Select Language:</option>
            <option value="English">English</option>
            <option value="France">France</option>
            <option value="German">German</option>
            <option value="Spanish">Spanish</option>
            <option value="Chinese">Chinese</option>
            <option value="Arabic">Arabic</option>
            <option value="Russian">Russian</option>
            <option value="Hindi">Hindi</option>
            <option value="Portuguese">Portuguese</option>
            <option value="Bengali">Bengali</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-bold">Distance:</label>
          <select
            value={locationAccessDenied ? '' : distance}
            onChange={handleDistanceChange}
            disabled={locationAccessDenied}
            className="select select-bordered w-full"
          >
            <option value="">Select Distance:</option>
            <option value="25">25 Miles</option>
            <option value="50">50 Miles</option>
            <option value="75">75 Miles</option>
            <option value="100">100 Miles</option>
          </select>
        </div>
        <div className="flex justify-between">
          <button className="btn btn-primary" onClick={handleFilter}>
            Apply Filters
          </button>
          <button className="btn btn-outline" onClick={handleChatRedirect}>
            Find a match
          </button>
        </div>
      </div>
    );
};

export default UserFilter;