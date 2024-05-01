import {ObjectId} from "mongodb";

const exportedMethods = {

    checkId(id) {
        if (!id) {
            throw `No id is provided`;
        }
        if (typeof id !== "string" || id.trim().length === 0) {
            throw `The id provided is not a string or an  empty string`;
        }
        id = id.trim()
        if (!ObjectId.isValid(id)) {
            throw `Invalid Object ID`;
        }
        return id;
    },

    checkGender(gender){
        if(!gender) throw "Gender is not provided";
        if(typeof gender !== 'string') throw "Password must be a string!";
        gender = gender.trim();
        const validGenders = ['male', 'female', 'others'];
        if (!validGenders.includes(gender)) throw "Invalid gender provided. Gender must be either 'male', 'female', or 'others'.";

        return gender;
    },

    checkLanguage(language){
        if (!language) throw "Language is not provided";
        if (typeof language !== 'string') throw "Language must be a string!";
        language = language.trim();

        const languages = [
            "english", "french", "german", "spanish", "chinese", "arabic","russian", "hindi", "portuguese", "bengali"]


        if (languages.includes(language.toLowerCase())) {
            return  language ;
        } else {
            throw "Country not found for the provided language.";
        }
    },

    checkAgeRange(age){
        if (!age) throw "Age is not provided";
        if (typeof age !== 'string') throw "Age must be a string!";
        let ranges = age.trim().split('-');

        if (ranges.length !== 2) throw "Invalid age range format";

        let minAge = parseInt(ranges[0]);
        let maxAge = parseInt(ranges[1]);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        const minBirthYear = new Date(currentDate);
        minBirthYear.setFullYear(currentYear - maxAge);

        const maxBirthYear = new Date(currentDate);
        maxBirthYear.setFullYear(currentYear - minAge);

        const formatDate = (date) => {
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${day}/${year}`;
        };

        return { min: new Date(formatDate(minBirthYear)), max : new Date(formatDate(maxBirthYear)) };
    },

    validateName(name, valName) {
        if (!name) {
            throw `Error: ${valName} not supplied`;
        }
        if (typeof name !== "string" || name.trim().length === 0) {
            throw `Error: ${valName} should be a valid string (no empty spaces)`;
        }

        name = name.trim();
        const nameRegex = /^[a-zA-Z]+$/;
        if (!nameRegex.test(name)) {
            throw `Error: ${valName} must only contain character a-z and should not contain numbers`;
        }
        if (name.length < 2 || name.length > 25) {
            throw `Error: ${valName} length must be at least 2 characters long with a max of 25 characters`
        }
        return name;
    },

    validateEmail(email) {
        if (!email) {
            throw "Error: Email is not supplied";
        }
        if (typeof email !== "string" || email.trim().length === 0) {
            throw "Error: Email should be a valid string (no empty spaces)";
        }
        email = email.trim().toLowerCase();
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        const validDomains = ["com", "edu", "org", "net"]
        if (!emailRegex.test(email)) {
            throw "Error: Email is in the wrong format";
        }

        const domain = email.split('@')[1].toLowerCase();
        if (!validDomains.some(validDomain => domain.endsWith(`.${validDomain}`))) {
            throw "Error: Email has an unsupported domain";
        }
        return email;
    },

    validatePhoneNumber(phoneNumber) {
        if (!phoneNumber) {
            throw "Error: Phone number not supplied";
        }
        if (typeof phoneNumber !== "string" || phoneNumber.trim().length === 0) {
            throw "Error: Phone number should be a valid string (no empty spaces)";
        }
        phoneNumber = phoneNumber.trim();

        const phoneRegex = /^\+\d{1,3}\s?(\d{1,4}\s?)?\d{4,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            throw "Error: Invalid phone number format. A country code is required.";
        }
        return phoneNumber;
    },

    validatePassword(password, valName) {
        if (!password) throw `Error: ${valName} not supplied`;
        if (typeof password !== "string" || password.trim().length <= 0) {
            throw `Error: ${valName} must be a valid string(no empty spaces)!`;
        }
        password = password.trim();
        if (password.length < 8) {
            throw `Error: ${valName} must be at least 8 characters`;
        }
        if (/\s/.test(password)) throw `Error: ${valName} must not contain spaces`;
        //There needs to be at least one uppercase character
        if (!/[A-Z]/.test(password)) {
            throw `Error: ${valName} must contain at least one uppercase character`;
        }
        if (!/[a-z]/.test(password)) {
            throw `Error: ${valName} must contain at least one lowercase character`;
        }
        //at least one number
        if (!/\d/.test(password)) {
            throw `Error: ${valName} must contain at least one number`;
        }
        //at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw `Error: ${valName} must contain at least one special character`;
        }
        return password;
    },

    generateCurrentDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minutes = date.getMinutes();
        return `${month}/${day}/${year} ${hour}:${minutes}`;
    },

    validateLanguages(languages){
        const topLanguages = [
            "English",
            "Arabic",
            "Bengali",
            "Chinese",
            "French",
            "German",
            "Hindi",
            "Indonesian",
            "Japanese",
            "Marathi",
            "Nigerian Pidgin",
            "Portuguese",
            "Russian",
            "Spanish",
            "Tamil",
            "Telugu",
            "Turkish",
            "Urdu",
            "Vietnamese"];

        return languages.map(language => {
            const normalizedLanguage = language.trim();
            if (!topLanguages.includes(normalizedLanguage)) {
                throw `Error: '${language}' is not a recognized top 20 language`;
            }
            return normalizedLanguage;
        });
    },

    validateDateTime(inputDate) {
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19[0-9]{2}|20[0-9]{2})$/;

        if (typeof inputDate !== "string") {
            throw "Date must be a string.";
        }
        inputDate = inputDate.trim();
        if (!dateRegex.test(inputDate)) {
            throw "Invalid date format. Must be in MM/DD/YYYY format.";
        }
        return new Date(inputDate);
    },

    validateGender(gender) {
        if (!gender) throw "Gender is not provided";
        gender = gender.trim().toLowerCase();
        if (gender !== 'male' && gender !== 'female') throw "Invalid gender provided. Gender must be either 'male' or 'female'.";
        return gender;
    },


}

export default exportedMethods
