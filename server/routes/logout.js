import { Router } from "express";

const router = Router();

router.route("/").get((req, res) => {
    if(req.session.loggedIn)
    {
        req.session.loggedIn=false;
    req.session.destroy()
    
    return res.status(200).json({"success":"logged out"})
    
    }
    else
    {
        res.status(400).json({error:"User not logged in"})
    }
});

export default router;