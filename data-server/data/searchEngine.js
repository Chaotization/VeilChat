import validation from "../validation";
import axios from "axios";
import {users} from "../config/mongoCollections";


let exportedMethods = {
    async getUsersByGender(gender){
        gender = validation.checkGender(gender)
        const userCollection = await users();
        const filteredUser = await userCollection.find({gender: gender}).toArray();

        return {users: filteredUser};
    },

    async getUsersByLanguage(language){
        let {countries, language} = validation.checkLanguage(language);
        const userCollection = await users();

        let allUsers = [];

        for(const country in countries){
            const filteredUser = await userCollection.find({country: country}).toArray();
            allUsers.push(filteredUser);
        }

        return { users: allUsers, language: language }
    },

    async getUserByDistance({ lat, lng }, distance) {
        const { data: { results } } = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${lat},${lng}`,
                key: process.env.Google_Maps_API_Key
            }
        });

        if (!results || results.length === 0) {
            throw "Unable to find address for the provided coordinates";
        }

        const userAddress = results[0].formatted_address;

        const userCollection = await users();
        const radius = distance / 3963.2;
        const usersWithinRange = await userCollection.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[lng, lat], radius]
                }
            },
            isActive: true
        }).toArray();

        return { userAddress, usersWithinRange };
    }

}