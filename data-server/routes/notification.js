import { Router } from "express";
import usersData from "../data/index.js";
const router = Router();
import twilio from 'twilio';
import validation from "../validation.js";
import xss from "xss";

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

const client = twilio(accountSid, authToken);

router.route("/newMessage").post(async (req, res) => {

    let userName = req.body.userName
    let friend
    try {

        let userId = validation.checkId(req.body.friendId);
        friend = await usersData.getUserInfoByUserId(userId);
    } catch (error) {
        return res.status(400).render('error', {
            title: "Inputs Error",
            errorMsg: error
        });
    }

    try {
        await client.messages.create({
            body: `You have new message from ${userName} haven't read`,
            from: '+18334580397',
            to: friend.phoneNumber
        });


        return res.status(200).json({ sendStatus: true });
    } catch (error) {
        return res.status(500).json({ sendStatus: false });
    }
});


router.route("/invitation").post(async (req, res) => {

    if (!req.isAuthenticated()){
        return res.status(401).render("error", {
            errorMsg: "Please Login to send a message",
            title: "Error"
        });
    }

    let user;
    let firstName = req.body.firstName;
    try {

        let userId = validation.checkId(req.body.id);
        firstName = validation.validateName(firstName, 'First Name')
        user = await usersData.getUserInfoByUserId(userId);
    } catch (error) {
        return res.status(400).render('error', {
            title: "Inputs Error",
            errorMsg: error
        });
    }

    try {
        await client.messages.create({
            body: `You have friend invitation from ${firstName} haven't read`,
            from: '+18334580397',
            to: user.phoneNumber
        });


        return res.status(200).send({ sendStatus: true });
    } catch (error) {
        return res.status(500).send({ sendStatus: false });
    }
});



export default router;