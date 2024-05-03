import Router, {json} from "express";
import bcrypt from "bcrypt";

import usersData from '../data/index.js';

const router = Router();

router.route("/signup").post(async (req, res) => {
    try {
        const userData = req.session.user;
        if (userData) {
            return res
                .status(403)
                .json({
                    message: "Forbidden: Sign out first to register as a new user..",
                });
        }
    } catch (e) {
        res.status(400).json({error: e})
    }
});

router.route("/signin").post(async (req, res) => {
    try {
        const userData = req.session.user;
        if (userData) {
            return res
                .status(403)
                .json({
                    message: `Forbidden, You are already signed in as ${req.session.user.username}`,
                });
        }
    } catch (e) {
    }
});
router.route("/logout").get(async (req, res) => {
    //code here for GET
    try {
        const userData = req.session.user;
        if (!userData) {
            return res
                .status(401)
                .json({message: "Unauthorized access, Sign in first."});
        }
        req.session.destroy();
        return res.status(200).json({message: "Logged out successfully.."});
    } catch (e) {
        res.status(400).json({message: "User can't be loggedout, sign in first.."});
    }
});

router.route("/").put(async (req, res) => {
    try {
        let updatedUser = await usersData.updateUserDetails(req.body);
        if (updatedUser) {
            return res.status(200).json(updatedUser)
        } else {
            return res.status(404).json({message: "No records found..."});
        }
    } catch (e) {
        return res.status(400).json({message: e});
    }

});
router.route("/changepassword").put(async (req, res) => {
    try {
        let updatedUser = await usersData.changePassword(req.body);
        if (updatedUser) {
            return res.status(200).json(updatedUser)
        } else {
            return res.status(404).json({error: "User not found"});
        }
    } catch (e) {
        return res.status(400).json({error: e});
    }

});
router.route("/addFriend").put(async (req, res) => {
    try {
        let updatedUser = await usersData.addFriend(req.body.id, req.body.friendId);
        if (updatedUser) {
            return res.status(200).json(updatedUser)
        } else {
            return res.status(404).json({message: "User not found"});
        }
    } catch (e) {
        return res.status(400).json({message: e});
    }

});
router.route("/removeFriend").put(async (req, res) => {
    try {
        let updatedUser = await usersData.removeFriend(req.body.id, req.body.friendId);
        if (updatedUser) {
            return res.status(200).json(updatedUser)
        } else {
            return res.status(404).json({message: "User not found"});
        }
    } catch (e) {
        return res.status(400).json({message: e});
    }

});

router.route('/userinfo').post(async(req,res)=>{
    try 
    {
        let email= req.body.email.trim();
        let userInfo=await usersData.getUserInfoByEmail(email);
        return res.status(200).json(userInfo);

    }
    catch(e)
    {
        return res.status(404).json({message:e})
    }
});


router.route('/changestatus').post(async(req,res)=>
{
 try{
    let email=req.body.email.trim();
    let status=req.body.status.trim();
    let userInfo=await usersData.setStatus(email,status);
    if(userInfo)
    {
        return res.status(200).json(userInfo)
    }
    else
    {
        return res.status(400).json({message:""})
    }
 }
 catch(e)
 {
    return res.status(404).json({message:e})
 }
});
router.route('/updateuser').post(async(req,res)=>{
    let user=req.body;
    try{
    if(user)
    {
        let updatedUser=await usersData.updateUser(user);
        if(updatedUser)
        {
            return res.status(200).json(updatedUser)
        }
        else
        {
            return res.status(404).json({message:"Couldn't update user"})
        }

    }}
    catch(e)
    {
        return res.status(400).json({message:e})
    }

});
router.route("/createuserwithemail").post(async(req,res)=>
{
    try{
    let email=req.body.email;
    let password=req.body.password;
    let _id=req.body.id;
    
    let createUser=await usersData.createAccountWithEmailAndPassword(email,password,_id);
    if(createUser)
    {
        return res.status(200).json(createUser);
    }
    else
    {
        return res.status(404).json({message:"Can not create an account using email and password"});
    }}
    catch(e)
    {
        return res.status(400).json({message:e});
    }

})
export default router;


