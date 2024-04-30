import { Router } from "express";
import usersData from "../data/index.js";
const router = Router();
import twilio from 'twilio';
import validation from "../validation.js";
import xss from "xss";

const accountSid = process.env.accountSid;
const authToken = process.env.authToken;

const client = twilio(accountSid, authToken);

router.route("/notification").post(async (req, res) => {

    let numOfMsgs = req.body.numOfMsgs;
    let user =null;

    if (!req.isAuthenticated()){
        return res.status(401).render("error", {
            errorMsg: "Please Login to send a message",
            title: "Error"
        });
    }

    try {

        let userId = validation.checkId(req.body.id);
        user = await usersData.getUserInfoByUserId(userId);
    } catch (error) {
        return res.status(400).render('error', {
            title: "Inputs Error",
            errorMsg: error
        });
    }

    try {
        await client.messages.create({
            body: `You have ${numOfMsgs} from ${user.firstName} haven't read`,
            from: '+18334580397',
            to: user.phoneNumber
        });


        return res.status(200).send({ sendStatus: true });
    } catch (error) {
        return res.status(500).send({ sendStatus: false });
    }
});

// router.route("/invitation").post(async (req, res) => {
//
//     let numOfMsgs = req.body.numOfMsgs;
//     let user =null;
//
//     if (!req.isAuthenticated()){
//         return res.status(401).render("error", {
//             errorMsg: "Please Login to send a message",
//             title: "Error"
//         });
//     }
//
//     try {
//
//         let userId = validation.checkId(req.body.id);
//         user = await usersData.getUserInfoByUserId(userId);
//     } catch (error) {
//         return res.status(400).render('error', {
//             title: "Inputs Error",
//             errorMsg: error
//         });
//     }
//
//     try {
//         await client.messages.create({
//             body: `You have ${numOfMsgs} from ${user.firstName} haven't read`,
//             from: '+18334580397',
//             to: user.phoneNumber
//         });
//
//
//         return res.status(200).send({ sendStatus: true });
//     } catch (error) {
//         return res.status(500).send({ sendStatus: false });
//     }
// });


export default router;