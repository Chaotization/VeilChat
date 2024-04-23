import { Router } from "express";

const router = Router();

router.route("/").get((req, res) => {
    if(req.session)
    {
    req.session.loggedIn=false;
    req.session.destroy()
    
    return res.status(200).json({"message":"logged out"})
    
    }
    else
    {
        res.status(400).json({"message":"User not logged in"})
    }
});

export default router;