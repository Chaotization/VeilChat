import users  from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

let exportedMethods = {
  async getAllUsers() {
    let usersCollection = await users();
    const usersList = await usersCollection.find({}).toArray();
    const newList = usersList.map({
      _id,
      first_name,
      last_name,
      email,
      city,
      state,
      country,
      status,
    });

    return newList;
  },
  async getUserById(id) {
    if (!id || !ObjectId.isValid(id)) {
        throw "Invalid Id";
      }
      id = id.toString().trim();
    id = id.trim();
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (user == null) throw "Error: No user found";

    return user;
  },

  async addUser(
    first_name,
    last_name,
    user_name,
    email,
    password,
    city,
    state,
    country,
    status = "online"
  ) {
    try{
    let regex = /^[A-Za-z ]+$/;
    if (!regex.test(first_name.trim())) {
      throw "Invalid First Name";
    }
    if (!regex.test(last_name.trim())) {
      throw "Invalid Last Name";
    }
    const r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!r.test(email)) {
      throw "Invalid email";
    }
    regex = /^.{6,}$/
    if (!regex.test(password)) {
      throw "Error: Password should match the requirements[atleast 8 characters consisting atleast( 1 upper case, 1 number, 1 special character, 1 lower case)";
    }

    let hashedPassword = await bcrypt.hash(password, 10);
regex=/^[^\s]+$/;
if(!regex.test(user_name))
{
    throw "Invalid user name"
}
    let user_since = new Date().getFullYear();
     const usersCollection = await users();
    let info = await usersCollection.findOne({ email: email });
    if (info) throw "Email already exists";

    let newUser = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      user_name:user_name.trim(),
      password: hashedPassword,
      city,
      state,
      country,
      friends: [],
      user_since: user_since,
      role: "user",
    };


    const insertInfo = await usersCollection.insertOne(newUser);
    if (!insertInfo.insertedId || !insertInfo.acknowledged)
      throw "Failed Inserting a user";
    else 
    return true;}
catch(e)
{
    throw e
}
  },

  async removeUser(id) {
    validation.isValidId(id);
    id = id.trim();
    const usersCollection = await users();
    const deletionInfo = await usersCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (deletionInfo.lastErrorObject.n === 0)
      throw [404, `Error: Could not delete user with id of ${id}`];
    return true;
  },
  async updateUserDetails(body) {
    let{id, first_name, last_name, email, city, state, country } = body
    let userInfo = {}
    if (!id || !ObjectId.isValid(id)) {
      throw "Invalid Id";
    }
    id = id.toString().trim();
    let userDetails = null;
    try {
      userDetails = await this.getUserById(id);
    } catch (e) {
      throw e;
    }
    let change = false;

    if (
      userDetails.first_name != first_name ||
      userDetails.last_name != last_name ||
      userDetails.email != email ||
      userDetails.city !== city ||
      userDetails.state !== state ||
      userDetails.country !== country
    ) {
      change = true;
    }
    let regex = /^[A-Za-z ]+$/;
    if (first_name) {
     
      if (!regex.test(first_name.trim())) {
        throw "Invalid First Name";
      }
      userInfo["first_name"]=first_name.trim()
    }
    if (last_name) {
      if (!regex.test(last_name.trim())) {
        throw "Invalid Last Name";
      }
      userInfo["last_name"]=last_name.trim()
    }
    if (email) {
      const r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!r.test(email)) {
        throw "Invalid email";
      }
      userInfo["email"]=email.trim();
    }
    if(city)
    {
        userInfo["city"]=city;
    }
    if(state)
    {
        userInfo["state"]=state;
    }
    if(country)
    {
        userInfo["country"]=country;
    }
    if (change) {
      const userCollection = await users();
        
      const updateInfo = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: userInfo },
        { returnDocument: "after" }
      );
      if (!updateInfo)
        throw [
          404,
          `Error: Update failed, could not find a user with id of ${id}`,
        ];

      return updateInfo;
    } else {
      throw "No changes";
    }
  },
  async getFullnames() {
    let userData = await users();
    const participants = await userData.find({}).toArray();
    let p = participants.map((user) => user.first_name + " " + user.last_name);
    if (!participants.length) {
      throw "No users in the database";
    }
    return p;
  },
  async verifyUser(email, password) {
    let result=true;
    const r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!r.test(email)) {
        result=false;
      throw "Invalid email format";
    }
    let userData = await users();
    let user = await userData.findOne({ email });
    if (user == null) {
        result=false;
      throw "No records found";
    }
    if (!await bcrypt.compare(password, user.password)) {
        result=false;
        throw "email/password incorrect!";
    }
    return [result, user]
  },
  async changePassword(body) {
    let{id, new_password}=body;
    let userDetails = null;
    if (!id || !ObjectId.isValid(_id.trim())) {
      throw "Invalid Id";
    }
    regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{}|\\,.?'";:/<>\-])\S{8,}$/;
    if (!regex.test(new_password)) {
      throw "Error: Password should match the requirements[atleast 8 characters consisting atleast( 1 upper case, 1 number, 1 special character, 1 lower case)";
    }
    try {
      userDetails = await this.getUserById(id);
    } catch (e) {
      throw e;
    }
    let hashedPassword = await bcrypt.hash(password, 10);

    const updateInfo = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword } },
      { returnDocument: "after" }
    );
    if (updateInfo.lastErrorObject.n === 0)
      throw [
        404,
        `Error: Update failed, could not find a user with id of ${id}`,
      ];

    return await updateInfo.value;
  },
  async addFriend(id, friendId){
    if (!id || !ObjectId.isValid(_id.trim())) {
        throw "Invalid Id";
      }

      if (!friendId || !ObjectId.isValid(friendId.trim())) {
        throw "Invalid Id";
      }

      let userDetails = await this.getUserById(id);
      let friendDetails=await this.getUserById(friendId);
      if(!friendDetails || !userDetails)
      {
        throw "User doesn't exist.."
      }
      const userCollection=users();
      const updateInfo = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $push: { friends: new ObjectId(friendId) } },
        { returnDocument: "after" }
      );
      if (updateInfo.lastErrorObject.n === 0)
      throw [
        404,
        `Error: Update failed, could not find a user with id of ${id}`,
      ];

    return await updateInfo.value;
  },
  async removeFriend(id, friendId){
    if (!id || !ObjectId.isValid(_id.trim())) {
        throw "Invalid Id";
      }

      if (!friendId || !ObjectId.isValid(friendId.trim())) {
        throw "Invalid Id";
      }

      let userDetails = await this.getUserById(id);
      let friendDetails=await this.getUserById(friendId);
      if(!friendDetails || !userDetails)
      {
        throw "User doesn't exist.."
      }
      const userCollection=users();
      const updateInfo = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $pull: { friends: new ObjectId(friendId) } },
        { returnDocument: "after" }
      );
      if (updateInfo.lastErrorObject.n === 0)
      throw [
        404,
        `Error: Update failed, could not find a user with id of ${id}`,
      ];

    return await updateInfo.value;
  }
};
export default exportedMethods;
