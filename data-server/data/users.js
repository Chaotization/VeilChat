import {users} from "../config/mongoCollections.js";
import {ObjectId} from "mongodb";
import bcrypt from "bcrypt";
import validation from "../validation.js";
// import redis from "redis";
import AWS from "aws-sdk";
import fs from "fs";
import redis from 'redis';

const client = redis.createClient();
client.connect().then(() => {
});
/**
 * @param {ObjectId} _id - A globally unique identifier to represent the user.
 * @param {string} firstName - First name of the user.
 * @param {string} lastName - Last name of the user.
 * @param {string} email - email of the user.
 * @param {[string,string]} languages - languages of the user he/she can speak.
 * @param {string} gender - gender of the user.
 * @param {string} dob - birthday of the user.
 * @param {string} phoneNumber - phoneNumber of the user.
 * @param {string} password - The password when users log in.
 * @param {string} userSince - the user's registration time.
 * @param {String} profilePictureLocation - The URL points to the item in S3
 * @param {HashTable{{user_id, “status”},{...},...}} friends - A HashTable that has friend_id as the key and the status as value.
 *        status: "sent", "rejected", "connected"
 * @param {String} role - A String variable reflects whether the user is an admin or user.
 */

// const client = redis.createClient();
// client.connect().then(() => {
// });
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_ID = process.env.AWS_SECRET_ACCESS_ID;
const bucketName = process.env.bucketName;
const social_password=process.env.social_signin_password

AWS.config.update({
    region: "us-east-1",
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_ID,
    correctClockSkew: true,
});

const createURLByPath = async (filePath) => {
    const s3 = new AWS.S3();
    const fileContent = fs.readFileSync(filePath);
    const randomString =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    const originalFileName = filePath.split("/").pop();
    const extension = originalFileName.slice(
        ((originalFileName.lastIndexOf(".") - 1) >>> 0) + 2
    );
    const currentFileName = `usersProfileFolder/${randomString}.${extension}`;

    const params = {
        Bucket: bucketName,
        Key: currentFileName,
        Body: fileContent,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                console.log("Successfully uploaded file to S3");
                const url = data.Location; // Using the location returned by S3
                console.log("File URL:", url);
                resolve(url);
            }
        });
    });
};

const createURLByFile = async (file) => {
    const s3 = new AWS.S3();
    const randomString =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    const extension = file.originalname.split(".").pop();
    const currentFileName = `usersProfileFolder/${randomString}.${extension}`;

    const fileContent = file.buffer;
    const params = {
        Bucket: bucketName,
        Key: currentFileName,
        Body: fileContent,
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                reject(err);
            } else {
                console.log("Successfully uploaded file to S3");
                const url = data.Location; // Using the location returned by S3
                console.log("File URL:", url);
                resolve(url);
            }
        });
    });
};

export const createUser = async (
    firstName,
    lastName,
    email,
    languages,
    gender,
    dob,
    phoneNumber,
    password,
    profilePictureLocation
) => {
    firstName = validation.validateName(firstName, "firstName");
    lastName = validation.validateName(lastName, "lastName");
    email = validation.validateEmail(email);
    phoneNumber = validation.validatePhoneNumber(phoneNumber);
    password = validation.validatePassword(password, "password");
    languages = validation.validateLanguages(languages);
    gender = validation.validateGender(gender);
    dob = validation.validateDateTime(dob);

    const userCollection = await users();
    const ifExist = await userCollection.findOne({email: email});
    if (ifExist) {
        throw `Error: ${email} is already registered, Please Login`;
    }

    // if (!profilePictureLocation) {
    //     profilePictureLocation = "https://veilchat-s3.s3.amazonaws.com/usersProfileFolder/defaultUserProfilePicture.jpg";
    // } else if (typeof profilePictureLocation === 'string') {
    //     profilePictureLocation = await createURLByPath(profilePictureLocation);
    // } else {
    //     profilePictureLocation = await createURLByFile(profilePictureLocation);
    // }

    const user = {
        firstName,
        lastName,
        email,
        languages,
        gender,
        dob,
        phoneNumber,
        password: await bcrypt.hash(password, 15),
        userSince: validation.generateCurrentDate(),
        lastOnlineAt: validation.generateCurrentDate(),
        profilePictureLocation,
        friends: []
    };

    const insertUser = await userCollection.insertOne(user);
    if (!insertUser.acknowledged || !insertUser.insertedId) {
        throw `Error: couldn't register the account: ${email}`;
    }
    return {insertedUser: true};
};

export const addUid = async (uid, email) => {
    const userCollection = await users();
    try {
        const updatedUser = await userCollection.findOneAndUpdate(
            {email: email},
            {$set: {uid: uid}},
            {returnDocument: "after"}
        );
        if (!updatedUser) {
            console.error("No user found with email:", email);
            return {error: "No user found"};
        }
        console.log("Updated User:", updatedUser);
        return updatedUser.value;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};

export const loginUser = async (email, password) => {
    email = validation.validateEmail(email);
    password = validation.validatePassword(password, "password");

    const userCollection = await users();
    const user = await userCollection.findOne({
        email: email
    });
    if (!user) {
        throw "Error: Either the email address or password is invalid";
    }
        let checkPassword=await bcrypt.compare(
        password,
        user.password
    );

    if (!checkPassword) {
        throw "Error: Either the email address or password is invalid"
    } else {
        const userId = user.uId.toString();
        const onlineUsersKey = 'onlineUsers';
        const updateUser = await userCollection.updateOne(
            {uId: userId},
            { $set: { lastOnlineAt: validation.generateCurrentDate() } }
        )
        if (updateUser.modifiedCount === 0) {
            throw `Error: Failed to update last online at for user with ID ${userId}`;
        }

        let exist = await client.exists(onlineUsersKey);
        if (!exist) {
            await client.json.set(onlineUsersKey, '$', [userId]);
        } else {
            const onlineUsers = await client.json.get(onlineUsersKey);
            if (!onlineUsers.includes(userId)) {
                await client.json.set(onlineUsersKey, '$', [...onlineUsers, userId]);
                console.log("added the login user to onlineUsers Readis Pool");
            }
        }

        return {
            userId: user._id.toString(),
            uId: user.uId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            dob: user.dob,
            phoneNumber: user.phoneNumber,
            languages: user.languages,
            userSince: user.userSince,
            lastOnlineAt: user.lastOnlineAt,
            profilePictureLocation: user.profilePictureLocation,
            friends: user.friends
        };
    }
};

export const logoutUser = async (userId) => {
    userId = validation.checkId(userId);
    const userCollection = await users();
    const user = await userCollection.findOne({
        uId: userId
    });
    if (!user) {
        throw "Error: Either the email address or password is invalid";
    }
    const updateUser = await userCollection.updateOne(
        {uId: userId},
        { $set: { lastOnlineAt: validation.generateCurrentDate() } }
    )
    if (updateUser.modifiedCount === 0) {
        throw `Error: Failed to update last online at for user with ID ${userId}`;
    }

    const onlineUsersKey = 'onlineUsers';
    let exist = await client.exists(onlineUsersKey);
    if (exist) {
        const onlineUsers = await client.json.get(onlineUsersKey);
        const filteredUsers = onlineUsers.filter(item => item !== userId.toString());
        if (filteredUsers.length !== onlineUsers.length) {
            await client.json.set(onlineUsersKey, '$', filteredUsers);
        }
    }
    return {
        logoutUser: true
    };
};

export const updateUserFirstName = async (
    userId,
    firstName
) => {
    firstName = validation.validateName(firstName, "firstName");
    userId = validation.checkId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({uId: userId});
    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }
    const updateUser = await userCollection.updateOne(
        {uId: userId},
        {$set: {firstName}}
    );
    if (updateUser.modifiedCount === 0) {
        throw `Error: Failed to update last name for user with ID ${userId}`;
    }
    return {updated: true};
}

export const updateUserLastName = async (userId, lastName) => {
    lastName = validation.validateName(lastName, "lastName");
    userId = validation.checkId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({uId: userId});
    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }
    const updateUser = await userCollection.updateOne(
        {uId: userId},
        {$set: {lastName}}
    );
    if (updateUser.modifiedCount === 0) {
        throw `Error: Failed to update last name for user with ID ${userId}`;
    }
    return {updated: true};
};

export const updateUserPassword = async (userId, oldPassword, newPassword) => {
    userId = validation.checkId(userId, "userId");
    oldPassword = validation.validatePassword(oldPassword, "oldPassword");
    newPassword = validation.validatePassword(newPassword, "newPassword");

    const userCollection = await users();
    const user = await userCollection.findOne({uId: userId});

    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw `Error: Old password is incorrect`;
    }

    if (await bcrypt.compare(newPassword, user.password)) {
        throw `Error: New password cannot be the same as the old password`;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 15);

    const updateUser = await userCollection.updateOne(
        {uId: userId},
        {$set: {password: hashedNewPassword}}
    );

    if (updateUser.modifiedCount === 0) {
        throw `Error: Failed to update password for user with ID ${userId}`;
    }
    return {updated: true};
};

export const updateUserLanguages = async (userId, languages) => {
    languages = validation.validateLanguages(languages);
    userId = validation.checkId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({uId: userId});
    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }
    const updateUser = await userCollection.updateOne(
        {uId: userId},
        {$set: {languages}}
    );
    if (updateUser.modifiedCount === 0) {
        throw `Error: Failed to update country for user with ID ${userId}`;
    }
    return {updated: true};
};

export const updateUserPhoneNumber = async (userId, phoneNumber) => {
    phoneNumber = validation.validatePhoneNumber(phoneNumber);
    userId = validation.checkId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({uId: userId});
    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }
    const updateUser = await userCollection.updateOne(
        {uId: userId},
        {$set: {phoneNumber}}
    );
    if (updateUser.modifiedCount === 0) {
        throw `Error: Failed to update phone number for user with ID ${userId}`;
    }
    return {updated: true};
};

// Update user's profile picture location
export const updateUserProfilePictureLocation = async (
    userId,
    profilePictureLocation
) => {
    userId = validation.checkId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({uId: userId});
    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }
    if (!profilePictureLocation) {
        profilePictureLocation =
            "https://veilchat-s3.s3.amazonaws.com/usersProfileFolder/defaultUserProfilePicture.jpg";
    } else if (typeof profilePictureLocation === "string") {
        profilePictureLocation = await createURLByPath(profilePictureLocation);
    } else {
        profilePictureLocation = await createURLByFile(profilePictureLocation);
    }

    const updateUser = await userCollection.updateOne(
        {uId: user.uId},
        {$set: {profilePictureLocation}}
    );
    if (updateUser.modifiedCount === 0) {
        throw `Error: Failed to update profile picture for user with ID ${userId}`;
    }
    return {updated: true};
};

//user has send, reject, accept, and delete operations on a friend
// updateFriendStatus(userId, targerUserId, "send") to add a friend, and then user{...,friends{targerUserId: "sent"}}, user{..., friends{userId: "reveiced"}}
// updateFriendStatus(userId, targerUserId, "reject") to reject a friend request, and then user{...,friends{}}, user{..., friends{userId: "rejected"}}
// updateFriendStatus(userId, targerUserId, "accept") to accept a friend request, and then user{...,friends{targerUserId: "connected"}}, user{..., friends{userId: "connected"}}
// updateFriendStatus(userId, targerUserId, "delete") to delete a friend, and then user{...,friends{}}, user{..., friends{}} (delete from both side)
export const updateFriendStatus = async (userId, friendId, newStatus) => {
    userId = validation.checkId(userId, "userId");
    friendId = validation.checkId(friendId, "friendId");
    if (!["send", "reject", "accept", "delete"].includes(newStatus)) {
        throw `Error: Invalid status '${newStatus}'`;
    }
    const userCollection = await users();
    const user = await userCollection.findOne({uId: userId});
    const friend = await userCollection.findOne({uId: friendId});

    let exist = user.friends.hasOwnProperty(friendId) && friend.friends.hasOwnProperty(userId);
    if(exist){
        return "The friend already exist"
    }

    if (newStatus === "reject") {
        const removeUpdateResultFromUser = await userCollection.updateOne(
            { uId: userId },
            { $unset: { [`friends.${friendId}`]: "" } }
        );

        const removeUpdateResultFromFriend = await userCollection.updateOne(
            { uId: friendId },
            { $unset: { [`friends.${userId}`]: "" } }
        );

        return {
            updatedStatus: true,
            message: `User ${userId} marked as rejected and removed from user ${friendId}'s friend list`,
        };
    } else if (newStatus === "accept") {
        const userUpdateResult = await userCollection.updateOne(
            { uId: userId },
            { $set: { [`friends.${friendId}`]: "accepted" } }
        );
        if (userUpdateResult.modifiedCount === 0) {
            throw `Error: Failed to update accepted friend status for user ${userId} to ${friendId}`;
        }
        const friendUpdateResult = await userCollection.updateOne(
            { uId: friendId },
            { $set: { [`friends.${userId}`]: "accepted" } }
        );
        if (friendUpdateResult.modifiedCount === 0) {
            throw `Error: Failed to update accepted friend status for user ${friendId} to ${userId}`;
        }
        return {
            updatedStatus: true,
            message: `Friend status updated accepted to ${newStatus} for both users`,
        };
    } else if (newStatus === "send") {

        const receivedUserFromFriend = await userCollection.updateOne(
            { uId: friendId },
            { $set: { [`friends.${userId}`]: "pending" } }
        );
        if (receivedUserFromFriend.modifiedCount === 0) {
            throw `Error: Failed to receive a friend request for friend ${friendId} to ${userId}`;
        }
        return {
            updatedStatus: true,
            message: `friend request sent`,
        };
    } else if (newStatus === "delete") {
        // if user send a friend request, update the user's friend status to sent
        const deleteFriendFromUser = await userCollection.updateOne(
            { uId: userId },
            { $unset: { [`friends.${friendId}`]: "" } }
        );
        if (deleteFriendFromUser.modifiedCount === 0) {
            throw `Error: Failed to update sent friend status for user ${userId} to ${friendId}`;
        }
        // and update the friend's friend status to received
        const deleteUserFromFriend = await userCollection.updateOne(
            { uId: friendId },
            { $set: { [`friends.${userId}`]: "connected" } }
        );
        if (deleteUserFromFriend.modifiedCount === 0) {
            throw `Error: Failed to update received friend status for user ${friendId} to ${userId}`;
        }
        return {
            updatedStatus: true,
            message: `Friend status delete friends for both users`,
        };
    }

};

export const getUserInfoByUserId = async (userId) => {
    userId = validation.checkId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({uId: userId});

    if (!user) {
        throw `Error: User with ID ${userId} not found`;
    }
    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
    };
};

export const getUserInfoByEmail = async (email) => {
    email = validation.validateEmail(email);
    const userCollection = await users();
    const user = await userCollection.findOne({email: email});

    if (!user) {
        throw `Error: User with email ${email} not found`;
    }
    return {
        userId: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dob:user.dob,
        languages: user.languages,
        userSince: user.userSince,
        lastOnlineAt: user.lastOnlineAt,
        profilePictureLocation: user.profilePictureLocation,
        friends: user.friends,
    };
}

export const getUserIdByEmail = async (email) => {
    email = validation.validateEmail(email);
    const userCollection = await users();
    const user = await userCollection.findOne({email: email});

    if (!user) {
        throw `Error: User with email ${email} not found`;
    }
    return user.uId.toString();
};

export const getUserPasswordById = async (userId) => {
    userId = validation.checkId(userId, "userId");
    const userCollection = await users();
    const user = await userCollection.findOne({uId: userId});

    if (!user) {
        throw `Error: User with _id ${userId} not found`;
    }
    return {
        password: user.password,
    };
};

export const getAllUsers = async () => {
    const userCollection = await users();
    const user = await userCollection.find({}).toArray();
    return user;
};


export const updateUser = async (user) =>
{   
    try{
        //let uid=user._id.trim();
        const userCollection=await users();
        let userInfo=await userCollection.findOne({email:user.email});
        if(!userInfo)
        {
            throw "Couldn't fetch data from the server"
        }
        if (user.firstName) {
            let fname = validation.validateName(user.firstName)
            userInfo['firstName'] = fname;
        }
        if (user.lastName) {
            let lname = validation.validateName(user.lastName)
            userInfo['lastName'] = lname;
        }
        if (user.phoneNumber) {
            const phoneNumber = validation.validatePhoneNumber(user.phoneNumber)
            userInfo['phoneNumber'] = phoneNumber
        }
        if (user.languages) {
            const languages = user.languages.map(validation.checkLanguage);
            userInfo['languages'] = languages;
        }
        if (user.dob) {
            const dob = validation.validateDateTime(user.dob)
            userInfo['dob'] = dob;
        }
        if (user.gender) {
            const gender = validation.checkGender(user.gender);
            userInfo['gender'] = gender;
        }
        if (user.profilePictureLocation) {
            userInfo['profilePictureLocation'] = user.profilePictureLocation;
        }
        let updatedUser = await userCollection.updateOne({email: user.email}, {$set: userInfo});
        if (!updatedUser.acknowledged) {
            throw "Couldn't update data";
        }
        userInfo = await getUserInfoByEmail(user.email);
        return userInfo;
    } catch (e) {
        throw e
    }
}

export const createAccountWithEmailAndPassword=async(user)=>
{
    if (!user) {
		throw "Login credentials must be provided"
	}
    let uId = user.uId.trim().toString()
	let email=validation.validateEmail(user.email);
	let password="";
	if(user.password)
	{
        password = validation.validatePassword(user.password, "password");
        password = await bcrypt.hash(password, 15);
	}
else
{
    password=social_password;
    password = await bcrypt.hash(password, 15);
}

   
	const userCollection = await users();
	const ifExist = await userCollection.findOne({ email: email });
	if (ifExist) {
		throw `Error: ${email} is already registered, Please Login`;
	}
	const new_user = {
        _id: new ObjectId(), 
        uId,
        firstName:"",
        lastName:"",
        email,
        languages:[],
        gender:"",
        dob:"",
        phoneNumber:"",
        password:password ,
        userSince: validation.generateCurrentDate(),
        lastOnlineAt: validation.generateCurrentDate(),
        profilePictureLocation:"",
        friends: []
    };

	const insertUser = await userCollection.insertOne(new_user);
	if (!insertUser.acknowledged || !insertUser.insertedId) {
		throw `Error: couldn't register the account: ${email}`;

	}
    const insertedUser= await getUserInfoByEmail(email);
	return insertedUser ;

}

export const checkStatus = async (receiverId, lastMessageTime) => {
    receiverId = validation.checkId(receiverId);
    const exist = await client.exists('onlineUsers');

    if (exist) {
        const allOnlineUsers = await client.json.get('onlineUsers');


        const isOnline = allOnlineUsers.includes(receiverId);

        const userCollection = await users();
        const user = await userCollection.findOne({uId: receiverId});
        if (!user) {
            throw `No user with ID ${receiverId}`;
        }

        const lastOnlineDate = new Date(user.lastOnlineAt);
        const lastMessageDate = new Date(lastMessageTime);

        if (isOnline || lastOnlineDate > lastMessageDate) {
            return {
                isOnline: true,
                message: "User is online or was last online after the last message."
            };
        } else {
            return {
                isOnline: false,
                message: "User is offline and was last online before the last message."
            };
        }
    } else {
        const userCollection = await users();
        const user = await userCollection.findOne({uId: receiverId});

        if (!user) {
            throw `No user with ID ${receiverId}`;
        }
        const lastOnlineDate = new Date(user.lastOnlineAt);
        const lastMessageDate = new Date(lastMessageTime);

        if (lastOnlineDate > lastMessageDate) {
            return {
                isOnline: false,
                message: "User was last online after the last message."
            };
        } else {
            return {
                isOnline: false,
                message: "User is offline and was last online before the last message."
            };
        }
    }
};
