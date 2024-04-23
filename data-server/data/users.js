import {users} from "../config/mongoCollections.js";
import {ObjectId} from "mongodb";
import validation from "../publicMethods.js";
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';

/**
 * @param {ObjectId} _id - A globally unique identifier to represent the user.
 * @param {string} firstName - First name of the user.
 * @param {string} lastName - Last name of the user.
 * @param {string} state - Email of the user.
 * @param {string} gender - Gender of the user
 * @param {string} phoneNumber - phoneNumber of the user.
 * @param {string} password - The password when users log in.
 * @param {String} profilePicture - The URL points to the item in S3
 * @param {HashTable{{user_id, “status”},{...},...}} friends - A HashTable that has friend_id as the key and the status as value.
 * @param {String} role - A String variable reflects whether the user is an admin or user.
 */

export const createUser = async (
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    profilePictureLocation,
    role
) => {
    firstName = validation.validateName(firstName, "firstName");
    // console.log(firstName);
    lastName = validation.validateName(lastName, "lastName");
    email = validation.validateEmail(email, "email");
    phoneNumber = validation.validatePhoneNumber(phoneNumber);
    password = validation.validatePassword(password, "password");

    role = validation.validateRole(role);

    const userCollection = await users();
    const ifExist = await userCollection.findOne({email: email});
    if (ifExist) {
        throw `Error: ${email} is already registered, Please Login`;
    }
    if(!profilePictureLocation){
        profilePictureLocation = "../pictures/defaultUserProfilePicture.jpg";
    }
    else{
        profilePictureLocation = await validation.validateIfFileExist(profilePictureLocation);
    }
    const user = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
        password: await bcrypt.hash(password, 15),
        reviewIds: [],
        profilePictureLocation: profilePictureLocation,
        drinkReserved: [],
        role: role
    }

    const insertUser = await userCollection.insertOne(user);
    if (!insertUser.acknowledged || !insertUser.insertedId) {
        throw `Error: couldn't register the account: ${email}`;
    }
    return {insertedUser: true};
}

export const loginUser = async (email, password) => {
    email = validation.validateEmail(email);
    password = validation.validatePassword(password);

    const userCollection = await users();
    const user = await userCollection.findOne({
        email: email
    });
    if (!user) {
        throw "Error: Either the email address or password is invalid";
    }
    const checkPassword = await bcrypt.compare(
        password,
        user.password
    );
    if (!checkPassword) {
        throw "Error: Either the email address or password is invalid"
    } else {
        return {
            userId: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            reviewIds: user.reviewIds,
            profilePictureLocation: user.profilePictureLocation,
            drinkReserved: user.drinkReserved,
            role: user.role
        };
    }
};

export const updateUser = async (
    firstName,
    lastName,
    email,
    phoneNumber,
    password,
    profilePictureLocation
) => {
    firstName = validation.validateName(firstName, "firstName");
    lastName = validation.validateName(lastName, "lastName");
    email = validation.validateEmail(email, "email");
    phoneNumber = validation.validatePhoneNumber(phoneNumber);
    // console.log(phoneNumber);
    password = validation.validatePassword(password, "password");

    const userCollection = await users();
    const user = await userCollection.findOne({ email: email });
    // console.log('original' + user);
    const match = await bcrypt.compare(password, user.password);
    if(match){
        throw "Error: This password is the same as the old password";
    }

    if (!user) {
        throw `Error: User with email ${email} not found`;
    }
    const oldProfilePictureLocation = user.profilePictureLocation;
    if(!profilePictureLocation){
        profilePictureLocation = "../public/pictures/defaultUserProfilePicture.jpg"
    }
    else{
        profilePictureLocation = await validation.validateIfFileExist(profilePictureLocation);
    }
    const updatedUser = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        password: await bcrypt.hash(password, 12),
        profilePictureLocation: profilePictureLocation
    };
    // console.log(updatedUser);
    // console.log('update' + updatedUser.phoneNumber);
    const updateUser = await userCollection.updateOne(
        { _id: user._id },
        { $set: updatedUser }
    );
    // console.log(updateUser);
    if (updateUser.modifiedCount === 0) {
        throw `Error: Failed to update user with email ${email}`;
    }
    try {
        if(oldProfilePictureLocation !=="public/pictures/defaultUserProfilePicture.jpg" && oldProfilePictureLocation !=="../pictures/defaultUserProfilePicture.jpg") {
            await validation.deleteAPicture(oldProfilePictureLocation);
        }
    } catch (error) {
        throw `Error: Failed to delete old drink picture at ${oldProfilePictureLocation}`;
    }
    const newUserInfo = await getUserInfoByEmail(email);

    return { updatedUser: true, newUserInfo:newUserInfo};
}

export const getAllReviewsByUserId = async (
    userId
) => {
    userId = validation.validateId(userId,"userId");
    const userCollection = await users();
    const user = await
        userCollection
            .findOne({ _id: new ObjectId(userId) });

    if (!user) {
        throw `Error: User with ID ${userId} not found, Cannot get his/her reviews`;
    }
    return user.reviewIds||[];
}

export const getAllDrinkReservedByUserId = async (
    userId
)=> {
    userId = validation.validateId(userId,"userId");
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }
    let drinkReserved = user.drinkReserved;

    drinkReserved.sort((a, b) => {
        let m = new Date(a.timestamp);
        let n = new Date(b.timestamp);
        if (m.getTime() < n.getTime()) {
            return -1;
        } else {
            return 1;}
    });
    return user.drinkReserved || [];
}


export const getUserInfoByUserId = async (
    userId
)=> {
    userId = validation.validateId(userId,"userId");
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        reviewIds: user.reviewIds,
        profilePictureLocation: user.profilePictureLocation,
        drinkReserved: user.drinkReserved,
        role: user.role
    };
}

export const getUserInfoByEmail = async (
    email
)=> {
    email = validation.validateEmail(email);
    const userCollection = await users();
    const user = await userCollection.findOne({ email: email });

    if (!user) {
        throw `Error: User with email ${email} not found`;
    }
    return {
        userId: user._id,
        password:user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        reviewIds: user.reviewIds,
        profilePictureLocation: user.profilePictureLocation,
        drinkReserved: user.drinkReserved,
        role: user.role
    };
}

export const getUserIdByEmail = async (
    email
)=> {
    email = validation.validateEmail(email);
    const userCollection = await users();
    const user = await userCollection.findOne({ email: email });

    if (!user) {
        throw `Error: User with email ${email} not found`;
    }
    return user._id.toString();
}

export const getUserPasswordById = async (
    userId
)=> {
    userId = validation.validateId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
        throw `Error: User with _id ${userId} not found`;
    }
    return {
        password: user.password
    };
}

export const deleteOneReviewFromUser = async (
    reviewId, userId
)=> {
    reviewId = validation.validateId(reviewId, "reviewId");
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId)});
    if (!user) {
        throw `Error: User with email ${userId} not found`;
    }
    let reviewList = user.reviewIds;
    for (let i = 0; i < reviewList.length; i++) {
        const element = reviewList[i];
        if (element === reviewId) {
            reviewList.splice(i, 1);
        }
    }
    const updateReviewIds = await userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { reviewIds: reviewList } }
    );
    if (updateReviewIds.modifiedCount === 0) {
        throw `Error: Could not delete reviewId${reviewId} from user!`;
    }
    return true;
}



export const addReviewIdToAUser = async (
    reviewId, userId
) => {
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(userId)});
    const UpdatedReviewId = [...user.reviewIds, reviewId];
    const updateResult = await userCollection.updateOne(
        { _id: user._id },
        { $set: { reviewIds: UpdatedReviewId } }
    );
    return user;
};

export const copyPictureAndReturnPath = async (file) => {
    try {

        const data = await fs.readFile(file.path);
        const extName = file.mimetype.split('/')[1];
        const imgName = `${file.filename}.${extName}`;
        const newPath = path.resolve(`./public/pictures/${imgName}`);
        await fs.writeFile(newPath, data);
        await fs.unlink(file.path);
        return `../public/pictures/${imgName}`;
    } catch (err) {
        throw  `Error: error when processing file: ${err.message}`;
    }
};

export const getAllUsers = async () => {
    const userCollection = await users();
    const user = await userCollection.find({}).toArray();
    return user;
};