import { Router } from "express";
import {searchData} from "../data/index.js";
const router = Router();

router.route("/").post(async (req, res) => {
    let uId = req.body.uId;
    let gender, language, age, distance, position;
    if(req.body.gender){
        gender = req.body.gender;
    }
    if(req.body.language){
        language = req.body.language;
    }
    if(req.body.age){
        age = req.body.age;
    }
    if(req.body.distance){
        position = req.body.userLocation;
        distance = req.body.distance;
    }

    try {
        let {userFound, selectedUser} = await searchData.filtering(uId,  {gender, language, age , distance, position});
        //return the matched user's id, gender, language, age, distance, position
        if(userFound){
            return res.status(200).json(selectedUser);
        }else{
            return "No active user found with criteria"
        }
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});


export default router;