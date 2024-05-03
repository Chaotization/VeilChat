import Router, {json} from "express";

import {updateFriendStatus} from "../data/users.js";

const router = Router();

router.route("/sendFriendRequest/:id").post(async (req, res) => {
    try {
        const userData = req.session.user;
        if (userData) {
            const userId = userData.userId;
            const targetUserId = req.params.id;
            const sendRequest = await updateFriendStatus(userId, targetUserId, "send");
            if (sendRequest.updatedStatus) {
                return res.status(200).json({message: "friend request sent"})
            } else {
                return res.status(500).json({error: "friend request failed to send!"});
            }
        } else {
            res.status(401).json({error: "Unauthorized: please login first!"})
        }
    } catch (e) {
        res.status(500).json({error: "Internal Server Error: please try again later!"})
    }
});


router.route("/rejectFriendRequest/:id").post(async (req, res) => {
    try {
        const userData = req.session.user;
        if (userData) {
            const userId = userData.userId;
            const targetUserId = req.params.id;
            const sendRequest = await updateFriendStatus(userId, targetUserId, "reject");
            if (sendRequest.updatedStatus) {
                return res.status(200).json({message: "reject request sent"})
            } else {
                return res.status(500).json({error: "reject request failed to send!"});
            }
        } else {
            res.status(401).json({error: "Unauthorized: please login first!"})
        }
    } catch (e) {
        res.status(500).json({error: "Internal Server Error: please try again later!"})
    }
});

router.route("/acceptFriendRequest/:id").post(async (req, res) => {
    try {
        const userData = req.session.user;
        if (userData) {
            const userId = userData.userId;
            const targetUserId = req.params.id;
            const sendRequest = await updateFriendStatus(userId, targetUserId, "accept");
            if (sendRequest.updatedStatus) {
                return res.status(200).json({message: "accept a friend request successfully"})
            } else {
                return res.status(500).json({error: "fail to accept the friend request!"});
            }
        } else {
            res.status(401).json({error: "Unauthorized: please login first!"})
        }
    } catch (e) {
        res.status(500).json({error: "Internal Server Error: please try again later!"})
    }
});

router.route("/deleteFriend/:id").post(async (req, res) => {
    try {
        const userData = req.session.user;
        if (userData) {
            const userId = userData.userId;
            const targetUserId = req.params.id;
            const sendRequest = await updateFriendStatus(userId, targetUserId, "delete");
            if (sendRequest.updatedStatus) {
                return res.status(200).json({message: `delete friend ${targetUserId} successfully`})
            } else {
                return res.status(500).json({error: `fail to delete a friend ${targetUserId}!`});
            }
        } else {
            res.status(401).json({error: "Unauthorized: please login first!"})
        }
    } catch (e) {
        res.status(500).json({error: "Internal Server Error: please try again later!"})
    }
});

export default router;
