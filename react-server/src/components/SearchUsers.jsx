import React, { useState } from 'react';
import axios from 'axios';

const UserFilter = () => {
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [language, setLanguage] = useState('');
    const [distance, setDistance] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const [locationAccessDenied, setLocationAccessDenied] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);

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
            const response = await axios.post('/api/filterUsers', {
                gender,
                age,
                language,
                distance,
                userLocation
            });

            setFilteredUsers(response.data.users);
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

    return (
        <div>
            <h2>User Filter</h2>
            <div>
                <label>Gender:</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label>Age:</label>
                <select value={age} onChange={(e) => setAge(e.target.value)}>
                    <option value="">Select Age Range</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                </select>
            </div>
            <div>
                <label>Languages:</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="">Select Language:</option>
                    <option value="English">English</option>
                    <option value="France">France</option>
                    <option value="German">German</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Russian">Russian</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Bengali">Bengali</option>
                </select>
            </div>
            <div>
                <label>Distance:</label>
                <select
                    value={locationAccessDenied ? '' : distance}
                    onChange={handleDistanceChange}
                    disabled={locationAccessDenied}
                >
                    <option value="">Select Distance:</option>
                    <option value="25">25 Miles</option>
                    <option value="50">50 Miles</option>
                    <option value="75">75 Miles</option>
                    <option value="100">100 Miles</option>
                </select>
            </div>
            <div>
                <button onClick={handleFilter}>Apply Filters</button>
            </div>
        </div>
    );
};

export default UserFilter;
