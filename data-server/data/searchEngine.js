import validation from "../validation.js";
import axios from "axios";
import redis from 'redis';
import users from '../config/mongoCollections.js'

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
    async getUsersByGender(gender) {
        try {
            gender = validation.checkGender(gender);
            const userCollection = await users();

            let filteredUsers;
            if (gender === 'others') {
                filteredUsers = await userCollection.find().toArray();
            } else {
                filteredUsers = await userCollection.find({ gender: gender }).toArray();
            }

            if (filteredUsers.length === 0) {
                throw new Error(`User with gender ${gender} not found`);
            }

            return { users: filteredUsers };
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to fetch users by gender: ${error.message}`);
        }
    },

    async getUsersByLanguage(language) {
        try {
            language = validation.checkLanguage(language);
            const userCollection = await users();

            const filteredUsers = await userCollection.find({ languages: { $in: [language.toLowerCase()] } }).toArray();

            if (filteredUsers.length === 0) {
                throw new Error(`User with language ${language} not found`);
            }

            return { users: filteredUsers };
        } catch (error) {
            console.error(`Failed to fetch users by language: ${error.message}`);
            throw new Error(`Failed to fetch users by language: ${error.message}`);
        }
    },

    async getUsersByAge(age) {
        try {
            let { min, max } = validation.checkAgeRange(age);

            const userCollection = await users();
            const filteredUsers = await userCollection.find({
                dob: {
                    $gte: new Date(min),
                    $lte: new Date(max)
                }
            }).toArray()

            if (filteredUsers.length === 0) {
                const minDateStr = min.toISOString().split('T')[0];
                const maxDateStr = max.toISOString().split('T')[0];
                throw new Error(`No users found within the age range from ${minDateStr} to ${maxDateStr}`);
            }

            return { users: filteredUsers };
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to fetch users by age range: ${error.message}`);
        }
    },


    async getUsersByMultiFields(userId, criteria){
        try {
            const userCollection = await users();
            const query = {};

            if (criteria.gender) {
                query.gender = validation.checkGender(criteria.gender);
            }

            if (criteria.age) {
                const { min, max } = validation.checkAgeRange(criteria.age);
                query.age = { $gte: min, $lte: max };
            }

            if(criteria.language) {
                query.language = validation.checkLanguage(criteria.language)
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
                    throw new Error("Unable to find address for the provided coordinates");
                }

                const userAddress = results[0].formatted_address;
                const exists = await client.exists('activeUsers');
                if(exists){
                    const activeUsers = await client.json.get('activeUsers');
                    const filteredUsers = activeUsers.filter((user) => user._id !== userId && user.position !== null);
                    if (filteredUsers.length === 0) throw "Error: No users nearby.";
                    const nearbyUsers = await findNearByUsers(filteredUsers, lat, lng, criteria.distance);
                    const nearbyUserIds = nearbyUsers.map(user => user._id);
                    query._id = { $in: nearbyUserIds };
                }

            }
            const filteredUsers = await userCollection.find(query).toArray();
            if (filteredUsers.length === 0) {
                throw "Error: No users found matching the provided criteria.";
            } else {
                return { users: filteredUsers };
            }
        } catch (error) {
            throw error;
        }
    },

    async filtering(userId, { gender = '', language = '', age = '', distance = 0, position = {} }) {
        const criteria = {gender, language, age, distance, position};
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
            return [];
        }else{
            user._id = userId;
            user.status = 'active';
            const exists = await client.exists('activeUsers');
            if(exists){
                const activeUsers = await client.json.get('activeUsers');
                const existUser = activeUsers.find((u) => u._id === userId);
                if(existUser){
                    const updatedUsers = activeUsers.map(u => u._id === userId ? user : u);
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
            filteredUsers = await this.getUsersByGender(activeCriteria.gender);
        } else if (activeCriteria.language) {
            filteredUsers = await this.getUsersByLanguage(activeCriteria.language);
        } else if (activeCriteria.age) {
            filteredUsers = await this.getUsersByAge(activeCriteria.age);
        }

        const randomIndex = Math.floor(Math.random() * filteredUsers.length);
        return [filteredUsers[randomIndex]];
    },
}

export default exportedMethods;