const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const validation = require('../validation');
const bcrypt = require('bcrypt');

router.post('/login', async (req,res) => {
    const loginBody = req.body;
    try{
        console.log("Login");
        let {email,password} = loginBody;
        email = validation.checkEmail(email, 'User email');
        password = validation.checkPassword(password, 'User password');
        let user;
        try {
            user = await userData.getUserByEmail(email);
        } catch (error) {
            error.message = "User not found";
            return res.status(404).json({error: error});
        }
        const resBy = await bcrypt.compare(password, user.password);
        if(!resBy) return res.status(404).json({error: "Invalid password"});
        return res.status(200).json(user);
    }catch(e){
        console.log(e)
        return res.status(500).json({error: e});
    }
});

router.post('/signup', async (req,res) => {
    const userBody = req.body;
    try{
        console.log("Signup");
        let {email,firstName,lastName,password,uid} = userBody;
        email = validation.checkEmail(email, 'User email');
        firstName = validation.checkString(firstName, 'User first name');
        lastName = validation.checkString(lastName, 'User last name');
        password = validation.checkPassword(password, 'User password');
        const newUser = await userData.addUser(email,firstName,lastName,password,uid);
        if(!newUser.userCreated){
            return res.status(404).json({error: "Invalid user"});
        }
        res.status(200).json(newUser.createdUser);
    }catch(e){
        console.log(e);
        return res.status(500).json({error: e});
    }
});

router.post('/changeUserPW', async (req,res) => {
    const userBody = req.body;
    try{
        let {email, oldPassword,newPassword} = userBody;
        email = validation.checkEmail(email, 'User email');
        oldPassword = validation.checkPassword(oldPassword, 'User password');
        newPassword = validation.checkPassword(newPassword, 'User password');
        let user = await userData.getUserByEmail(email);
        const resBy = await bcrypt.compare(oldPassword, user.password);
        if(!resBy) return res.status(404).json({error: "Invalid password"});
        user.password = (await bcrypt.hash(newPassword, 10)).toString();
        user = userData.updateUser(user._id.toString(),user);
        res.status(200).json(user);
    }catch(e){
        console.log(e);
        return res.status(500).json({error: e});
    }
});

router.post('/changeUserInfo', async (req,res) => {
    const userBody = req.body;
    try{
        let {email, firstName, lastName} = userBody;
        email = validation.checkEmail(email, 'User email');
        firstName = validation.checkString(firstName, 'User first name');
        lastName = validation.checkString(lastName, 'User last name');
        let user = await userData.getUserByEmail(email);
        user.firstName = firstName;
        user.lastName = lastName;
        user = userData.updateUser(user._id.toString(),user);
        res.status(200).json(user);
    }catch(e){
        console.log(e);
        return res.status(500).json({error: e});
    }
});

router.get('/logout', async (req,res) => {
    try {
        req.session.email = undefined;
        res.status(200).json("Logout success");
    }catch(e){
        return res.status(500).json({error: e});
    }
});

router.get("/users/:searchTerm", async (req,res) => {
    try {
        let searchTerm = validation.checkString(req.params.searchTerm, "Search Term");
        let results = await userData.search(searchTerm);
        return res.status(200).json(results);
    }catch(e){
        return res.status(500).json({error: e});
    }
});

router.get("/userId/:userEmail", async (req,res) => {
    try {
        let email = req.params.userEmail;
        email = validation.checkEmail(email);
        let user = await userData.getUserByEmail(email);
        return res.status(200).json({id: user._id, schedules: user.schedules.ownedSchedules});
    }catch(e){
        return res.status(500).json({error: e});
    }
});

module.exports = router;