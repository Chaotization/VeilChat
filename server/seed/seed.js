require('dotenv').config();
const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const schedules = data.schedules;
const schedulesData = data.schedules;
const usersData = data.users;
const users = data.users;
const invites = data.invites;

const firebase = require('firebase');
var firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

firebase.initializeApp(firebaseConfig);

async function main() {
  try{
    const db = await dbConnection.dbConnection();
    await db.dropDatabase();


    let now = new Date()
    let start = new Date(now.getTime() + 3600000)
    let end = new Date(now.getTime() + 7200000)
    let nextMonthStart = new Date(1674044090000);
    let nextMonthEnd = new Date(1674047690000)

    let user1 = {email: "rahul@xyz.com",firstName: "Rahul",lastName: "Ray",password: "rahul@1"}
    let user2 = {email: "sam@xyz.com",firstName: "Sam",lastName: "Ray",password: "same@1"}

    // User1 seed
    let user = user1;
    try{
      await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
    } catch (e) {
      if(e.code !== "auth/email-already-in-use"){
        console.log(e);
      }
    }
    await firebase.auth().signInWithEmailAndPassword(user.email,user.password);
    await firebase.auth().currentUser.updateProfile({ displayName: user.firstName + " " + user.lastName });
    user1 =  await users.addUser(user.email,user.firstName,user.lastName,user.password,firebase.auth().currentUser.uid);
    await firebase.auth().signOut();
    
    //User2 seed
    user = user2;
    try{
      await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
    } catch (e) {
      if(e.code !== "auth/email-already-in-use"){
        console.log(e);
      }
    }
    await firebase.auth().signInWithEmailAndPassword(user.email, user.password);
    await firebase.auth().currentUser.updateProfile({ displayName: user.firstName + " " + user.lastName });
    user2 =  await users.addUser(user.email,user.firstName,user.lastName,user.password,firebase.auth().currentUser.uid);
    await firebase.auth().signOut();

    let schedule1 = await schedules.addSchedule('Long Trip', user1.createdUser._id.toString(),[],[]);
    let event1 = await schedules.createEvent(user1.createdUser._id.toString(), schedule1._id.toString(), "Beach trip", "Trip to the beach", 0, nextMonthStart, nextMonthEnd)



    // let invite = {
    //   senderId: "638e235b97ea22d6e1b281ad",
    //   scheduleId: "638e235b97ea22d6e1b281af"

    // }

    // await users.addInvite("638e235b97ea22d6e1b281ae", invite);
    
    console.log('Done seeding database');
  
   
  }catch(e){
    console.log(e);
  }
  await dbConnection.closeConnection();
  }


  /**
   * 1. Create Host and Guest - Done
   * 2. Create Schedule
   * 3. Create Invites
   */
  const invitesSeed = async function() {
    /**
     * 1. Create 4 Users (0, 1, 2, 3)
     * 2. Create Schedule from one User to another
     */
     let host1 = {email: "host1@xyz.com", firstName: "Host 1", lastName: "First", password: "Host@1"}
     // Create User in Firebase 
      try{
        await firebase.auth().createUserWithEmailAndPassword(host1.email, host1.password);
      } catch (e) {
        if(e.code !== "auth/email-already-in-use"){
          console.log(e);
        }
      }
      // Add user to Mongo DB
      await firebase.auth().signInWithEmailAndPassword(host1.email, host1.password);
      await firebase.auth().currentUser.updateProfile({ displayName: host1.firstName + " " + host1.lastName });
      host1 =  await users.addUser(host1.email, host1.firstName, host1.lastName, host1.password, firebase.auth().currentUser.uid);
      host1 = host1.createdUser;
      await firebase.auth().signOut();
      console.log("created Host1");


      let guest1 = {email: "guest1@xyz.com",firstName: "Guest 1",lastName: "First",password: "Guest@1"}
     // Create User in Firebase 
      try{
        await firebase.auth().createUserWithEmailAndPassword(guest1.email, guest1.password);
      } catch (e) {
        if(e.code !== "auth/email-already-in-use"){
          console.log(e);
        }
      }
      // Add user to Mongo DB
      await firebase.auth().signInWithEmailAndPassword(guest1.email, guest1.password);
      await firebase.auth().currentUser.updateProfile({ displayName: guest1.firstName + " " + guest1.lastName });
      guest1 =  await users.addUser(guest1.email, guest1.firstName, guest1.lastName, guest1.password, firebase.auth().currentUser.uid);
      guest1 = guest1.createdUser;
      await firebase.auth().signOut();
      console.log("created Guest1");

      // Create a schedule by host1
      const schedule1 = await schedulesData.addSchedule("Holiday Event", host1.id.toString(), [], []);
      console.log("created Schedule1");

      // Invite 
      await usersData.addInvite(guest1.id.toString(), {scheduleId: schedule1._id.toString(), senderId: host1.id.toString()});
      console.log("Invitation Sent");


      //Adding New User

      let host2 = {email: "host2@xyz.com", firstName: "Host 2", lastName: "second", password: "Host@1"}
     // Create User in Firebase 
      try{
        await firebase.auth().createUserWithEmailAndPassword(host2.email, host2.password);
      } catch (e) {
        if(e.code !== "auth/email-already-in-use"){
          console.log(e);
        }
      }
      // Add user to Mongo DB
      await firebase.auth().signInWithEmailAndPassword(host2.email, host2.password);
      await firebase.auth().currentUser.updateProfile({ displayName: host2.firstName + " " + host2.lastName });
      host2 =  await users.addUser(host2.email, host2.firstName, host2.lastName, host2.password, firebase.auth().currentUser.uid);
      host2 = host2.createdUser;
      await firebase.auth().signOut();
      console.log("created host2");


      let guest2 = {email: "guest2@xyz.com",firstName: "Guest 1",lastName: "First",password: "Guest@1"}
     // Create User in Firebase 
      try{
        await firebase.auth().createUserWithEmailAndPassword(guest2.email, guest2.password);
      } catch (e) {
        if(e.code !== "auth/email-already-in-use"){
          console.log(e);
        }
      }
      // Add user to Mongo DB
      await firebase.auth().signInWithEmailAndPassword(guest2.email, guest2.password);
      await firebase.auth().currentUser.updateProfile({ displayName: guest2.firstName + " " + guest2.lastName });
      guest2 =  await users.addUser(guest2.email, guest2.firstName, guest2.lastName, guest2.password, firebase.auth().currentUser.uid);
      guest2 = guest2.createdUser;
      await firebase.auth().signOut();
      console.log("created guest2");

      // Create a schedule by host2
      const schedule2 = await schedulesData.addSchedule("Holiday Event", host2.id.toString(), [], []);
      console.log("created schedule2");

      // Invite 
      await usersData.addInvite(guest2.id.toString(), {scheduleId: schedule2._id.toString(), senderId: host2.id.toString()});
      console.log("Invitation Sent");

      await usersData.addInvite(guest2.id.toString(), {scheduleId: schedule1._id.toString(), senderId: host1.id.toString()});
      console.log("Invitation Sent");
  }

  try{
    // main();
    invitesSeed();
  }
  catch(e){
    console.log(e);
  };