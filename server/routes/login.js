import { Router } from "express";
import usersData from "../data/users.js";

const router = Router();

router.route("/").post(async (req, res) => {
    if(req.session && req.session.loggedIn)
    {
        return res.status(400).json({error:"User already logged in, logout first"})
    }
  let email = req.body.email;
  let password = req.body.password;


  try{
    const [user,result] = await usersData.verifyUser(email, password)
    console.log(user, result)
    if(result){
      req.session.loggedIn = true;
      req.session.user=user;
      return  res.status(200).json({Message:"Logged in"})
    }
  }catch(e){
   return  res.status(400).send({error:e});
  }
});

export default router;