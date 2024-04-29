import { Router } from "express";
import {searchData} from "../data/index.js";
const router = Router();

router.route("/").post(async (req, res) => {
    let id = req.body._id;
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
        let filteredUsers = await searchData.filtering(id,  {gender, language, age , distance, position});
        return res.json(filteredUsers);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});


export default router;