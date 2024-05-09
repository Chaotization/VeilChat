import { Router } from "express";
import { searchData } from "../data/index.js";
const router = Router();
const chatRooms = {};

const generateChatId = () => {
	return "chatId_" + Date.now() + Math.round(Math.random(0, 10) * 10);
};

router.route("/").post(async (req, res) => {
	let uId = req.body.uId;
	let gender, language, age, distance, position;
	if (req.body.gender) {
		gender = req.body.gender;
	}
	if (req.body.language) {
		language = req.body.language;
	}
	if (req.body.age) {
		age = req.body.age;
	}
	if (req.body.distance) {
		position = req.body.userLocation;
		distance = req.body.distance;
	}

	try {
		let { userFound, selectedUser } = await searchData.filtering(uId, {
			gender,
			language,
			age,
			distance,
			position,
		});

		if (userFound) {
			let chatId;
			const chatKey = [uId, selectedUser.uId].sort().join("_");

			if (chatRooms[chatKey]) {
				chatId = chatRooms[chatKey];
			} else {
				chatId = generateChatId();
				chatRooms[chatKey] = chatId;
			}

			return res.status(200).json({
				success: true,
				filteredUserId: selectedUser.uId,
				chatId,
			});
		} else {
			return res.status(200).json({
				success: false,
				filteredUserId: null,
			});
		}
	} catch (error) {
		console.error("Error:", error.message);
		res.status(500).send("Internal Server Error");
	}
});

router.route("/exist").post(async (req, res) => {
    let userId = req.body.userId;
    try {
        const response = await searchData.existSearch(userId);

        if (response.deleted) {
            return res.status(200).json({deleted: true});
        } else {
            return res.status(404).json({ deleted: false, message: "Unable to delete user" });
        }
    }catch (error){
        console.log(error);
    }

});


export default router;
