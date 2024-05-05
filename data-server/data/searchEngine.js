import validation from "../validation.js";
import axios from "axios";
import redis from 'redis';
import {users} from '../config/mongoCollections.js'
import {ObjectId} from "mongodb";

const client = redis.createClient();
client.connect().then(() => {
});

const findNearByUsers = async (users, lat, lng, distance) => {
    const origins = `${lat},${lng}`;
    const destinations = users.map(user => `${user.position.lat},${user.position.lng}`).join('|');

    const { data } = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
            origins,
            destinations,
            key: process.env.Google_Maps_API_Key,
            units: 'imperial'
        }
    });

    if(data.length === 0) throw "Error: Internal Server Error";

    const nearbyUsers = [];


    data.rows[0].elements.forEach((element, index) => {
        const distanceText = element.distance.text;
        const match = distanceText.match(/(\d+(\.\d+)?)\s*(\w+)/);
        if (match) {
            const [fullMatch, numericPart, decimalPart, unit] = match;
            const distanceValue = parseFloat(`${numericPart}${decimalPart || ''}`);
            const distanceInMiles = unit === 'mi' ? distanceValue : distanceValue * (unit === 'ft' ? 0.000189394 : 0.62137);

            if (distanceInMiles <= distance) {
                nearbyUsers.push(users[index]);
            }
        }
    });

    return nearbyUsers;
};

let exportedMethods = {
    async getUsersByGender(userId, gender) {
        try {
            userId = validation.checkId(userId);
            gender = validation.checkGender(gender);
            const userCollection = await users();
            const currentUser = await userCollection.findOne({uId: userId});
            let allUsers = [];
            if (gender === 'others') {
                allUsers = await userCollection.find({}).toArray();
            } else {
                allUsers = await userCollection.find({gender: gender}).toArray();
            }

            const exists = await client.exists('activeUsers');
            let activeUsers = [];
            if (exists) {
                activeUsers = await client.json.get('activeUsers');
            }

            const filteredUsers = allUsers.filter(user =>
                activeUsers.some(activeUser => activeUser.uId === user.uId)
                && !currentUser.friends[user.uId]
                && user.uId.toString() !== userId
            );

            if (filteredUsers.length === 0) {
                return [];
            }

            return filteredUsers;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to fetch users by gender: ${error.message}`);
        }
    },

    async getUsersByLanguage(userId, language) {
        try {
            userId = validation.checkId(userId);
            language = validation.checkLanguage(language);
            const userCollection = await users();
            const currentUser = await userCollection.findOne({uId: userId});
            const allUsers = await userCollection.find({ languages: { $in: [language.toLowerCase()] } }).toArray();

            const exists = await client.exists('activeUsers');
            let activeUsers = [];
            if (exists) {
                activeUsers = await client.json.get('activeUsers');
            }

            const filteredUsers = allUsers.filter(user =>
                activeUsers.some(activeUser => activeUser.uId === user.uId)
                && user.uId.toString() !== userId
                && !currentUser.friends.hasOwnProperty(userId)
            );

            if (filteredUsers.length === 0) {
                return [];
            }

            return filteredUsers;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to fetch users by language: ${error.message}`);
        }
    },

    async getUsersByAge(userId, age) {
        try {
            userId = validation.checkId(userId);
            let { min, max } = validation.checkAgeRange(age);

            const userCollection = await users();
            const currentUser = await userCollection.findOne({uId: userId});
            const allUsers = await userCollection.find({
                dob: {
                    $gte: min,
                    $lte: max
                }
            }).toArray()

            const exists = await client.exists('activeUsers');
            let activeUsers = [];
            if (exists) {
                activeUsers = await client.json.get('activeUsers');
            }

            const filteredUsers = allUsers.filter(user =>
                activeUsers.some(activeUser => activeUser.uId === user.uId)
                && user.uId.toString() !== userId
                && !currentUser.friends.hasOwnProperty(userId)
            );


            if (filteredUsers.length === 0) {
                return [];
            }

            return filteredUsers;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to fetch users by age: ${error.message}`);
        }
    },


    async getUsersByMultiFields(userId, criteria){
        try {
            userId = validation.checkId(userId)
            const userCollection = await users();
            const currentUser = await userCollection.findOne({uId: userId});
            const query = {};

            if (criteria.gender) {
                query.gender = validation.checkGender(criteria.gender);
            }

            if (criteria.age) {
                const { min, max } = validation.checkAgeRange(criteria.age);
                query.dob = {$gte: new Date(min), $lte: new Date(max)};
            }

            if(criteria.language) {
                const language = validation.validateLanguages(criteria.language);
                query.languages = { $in: [language] };
            }

            if (criteria.distance && criteria.position.lat && criteria.position.lng) {
                const { lat, lng } = criteria.position;
                const { data: { results } } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        latlng: `${lat},${lng}`,
                        key: process.env.Google_Maps_API_Key
                    }
                });

                if (!results || results.length === 0) {
                    return "Unable to find address for the provided coordinates";
                }

                const userAddress = results[0].formatted_address;
                const exists = await client.exists('activeUsers');
                if(exists){
                    const activeUsers = await client.json.get('activeUsers');
                    const filteredUsers = activeUsers.filter((user) => user.uId !== userId && user.position);
                    if(!filteredUsers || filteredUsers.length === 0) return [];
                    const nearbyUsers = await findNearByUsers(filteredUsers, lat, lng, criteria.distance);
                    const nearbyUserIds = nearbyUsers.map(user => user.uId);
                    const userQueries = nearbyUserIds.map(id => ({ uId: new ObjectId(id) }));
                    query.$or = userQueries;
                }

            }
            const allUsers = await userCollection.find(query).toArray();
            const filteredUsers = allUsers.filter(user => !currentUser.friends.hasOwnProperty(user._id.toString())
            );
            if (filteredUsers.length === 0) {
                return [];
            }
            return filteredUsers ;
        } catch (error) {
            throw error;
        }
    },

    async filtering(userId,  {gender = '', language = '', age = '', distance = 0, position = {}} ) {
        let activeCriteria = {};

        let user = {};

        if (gender) activeCriteria.gender = gender;
        if (language) activeCriteria.language = language;
        if (age) activeCriteria.age = age;
        if (distance > 0 && Object.keys(position).length > 0) {
            activeCriteria.distance = distance;
            activeCriteria.position = position;
            user.position = position;
        }

        const numberOfActiveFilters = Object.keys(activeCriteria).length;

        if (numberOfActiveFilters === 0) {
            return "Please fill some of form to find the match users";
        }else{
            user.uId = userId;
            user.status = 'active';
            const exists = await client.exists('activeUsers');
            if(exists){
                const activeUsers = await client.json.get('activeUsers');
                const existUser = activeUsers.find((u) => u.uId === userId);
                if(existUser){
                    const updatedUsers = activeUsers.map(u => u.uId === userId ? user : u);
                    client.json.set('activeUsers', '$', updatedUsers);
                }else{
                    client.json.set('activeUsers', '$', [...activeUsers, user]);
                }
            }else{
                client.json.set('activeUsers', '$', [user]);
            }
        }

        if (numberOfActiveFilters > 1) {
            const filteredUsers = await this.getUsersByMultiFields(userId, activeCriteria);
            const randomIndex = Math.floor(Math.random() * filteredUsers.length);
            return [filteredUsers[randomIndex]];
        }


        let filteredUsers = [];
        if (activeCriteria.gender) {
            filteredUsers = await this.getUsersByGender(userId, activeCriteria.gender);
        } else if (activeCriteria.language) {
            filteredUsers = await this.getUsersByLanguage(userId, activeCriteria.language);
        } else if (activeCriteria.age) {
            filteredUsers = await this.getUsersByAge(userId, activeCriteria.age);
        }

        if (filteredUsers.length === 0) {
            return {userFound: false, filteredUsers: []}
        }
        const randomIndex = Math.floor(Math.random() * filteredUsers.length);
        if (filteredUsers.length > 0) {
            return {
                userFound: true,
                selectedUser: filteredUsers[randomIndex]
            };
        } else {
            return {
                userFound: false,
                selectedUser: null
            };
        }
    },
}

export default exportedMethods;