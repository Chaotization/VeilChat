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

    checkEmail(email) {
        if (!email) throw "Please provide email";
        if (typeof email !== "string" || email.trim().length <= 0) throw "Please provide a valid email";
        email = email.trim().toLowerCase();
        const emailPrefixRegex = /^[a-z0-9!#$%&'*+\-/=?^_`{|}~.]+@/i;
        const emailPostfixRegex = /@stevens\.edu$/i;
        if (!emailPrefixRegex.test(email)) {
            throw "Email address should contain only letters, numbers, and common special symbols !#$%&'*+\\-/=?^_`{|} before the @ character"
        }
        if (!emailPostfixRegex.test(email)) {
            throw "Error: Email address should end with stevens.edu";
        }
        return email;
    },

    checkPassword(password) {
        if (!password) throw "Password not provided";
        if (typeof password !== "string") throw "Password must be a string!";
        password = password.trim();
        if (password.length < 8 || password.length > 25) throw "Password must be at least 8 characters and less than 25 characters";
        const spaceRegex = /\s/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,25}$/;
        if (spaceRegex.test(password)) throw "Password must not contain whitespace";
        if (!passwordRegex.test(password)) throw "Password must contain at least 1 uppercase character, 1 lowercase character, 1 number, and 1 special character";
        return password;
    },

    checkGender(gender){
        if(!gender) throw "Gender is not provided";
        if(typeof gender !== 'string') throw "Password must be a string!";
        gender = gender.trim();
        if(gender.toLowerCase() !== 'male' || gender.toLowerCase() !== 'female' || gender.toLowerCase() !== 'others') throw "Invalid gender provided. Gender must be either 'male', 'female', or 'others'.";

        return gender;
    },

    checkLanguage(language){
        if (!language) throw "Language is not provided";
        if (typeof language !== 'string') throw "Language must be a string!";
        language = language.trim();

        const countryLanguages = {
            "English": ["United States", "United Kingdom", "Canada", "Australia", "New Zealand", "Ireland"],
            "French": ["France", "Canada", "Belgium", "Switzerland"],
            "German": ["Germany", "Austria", "Switzerland", "Belgium", "Luxembourg"],
            "Spanish": ["Mexico", "Spain", "Argentina", "Colombia", "Peru"],
            "Mandarin": ["China", "Singapore"],
            "Arabic": ["Egypt", "Saudi Arabia", "United Arab Emirates", "Iraq"],
            "Russian": ["Russia", "Ukraine", "Kazakhstan", "Belarus"],
            "Hindi": ["India"],
            "Portuguese": ["Brazil", "Portugal"],
            "Bengali": ["Bangladesh"]
        };


        if (language.toLowerCase() in countryLanguages) {
            return { countries: countryLanguages[language.toLowerCase()], language };
        } else {
            throw "Country not found for the provided language.";
        }
    },

    checkAgeRange(age){
        if (!age) throw "Age is not provided";
        if (typeof age !== 'string') throw "Age must be a string!";
        let ranges = age.trim().split('-');

        if (ranges.length !== 2) throw "Invalid age range format";

        let min = parseInt(ranges[0]);
        let max = parseInt(ranges[1]);

        if (isNaN(min) || isNaN(max)) throw "Invalid age range format";

        if (min < 0 || max < 0 || min > max) throw "Invalid age range";

        return { min, max };
    }

}

export default exportedMethods
