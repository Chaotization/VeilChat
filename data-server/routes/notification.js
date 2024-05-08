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


router.route("/verification").post(async (req, res) => {
    const phoneNumber = req.body.phoneNumber
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    try {
        await client.messages.create({
            body: `You verification code: ${verificationCode}`,
            from: '+18666664001',
            to: phoneNumber
        });


        return res.status(200).send({ sendStatus: true, verificationCode: verificationCode });
    } catch (error) {
        return res.status(500).send({ sendStatus: false, error: 'Failed to send verification code' });
    }
});




export default router;