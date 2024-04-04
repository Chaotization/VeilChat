const express = require('express');
const router = express.Router();
const data = require('../data');
const { checkEmail, checkId } = require('../validation');
const invitesData = data.invites;
const schedulesData = data.schedules;
const usersData = data.users;

/**
 * Get Invites of the logged in User
 * [
 *   {
 *      id: '',
 *      name: '',
 *      creator: {
 *              userName: ''
 *          },
 *      events: []
 *    }
 * ]
 */
router.get('/', async(req,res)=>{
    try {
        //console.log(req.headers);
        const email = req.session.email;
        checkEmail(email, "Email");
    } catch(e) {
        return res.status(400).json({"ERROR": e});
    }
    
    try{
        const email = req.session.email;
        // Retrieve my Invites
        const user = await usersData.getUserByEmail(email);
        const myInvites = user.invites;

        const invitesList = [];
        // Retreive Schedule Info
        for (let invite of myInvites) {
            const schedule = await schedulesData.getScheduleById(invite.scheduleId);
            const sender = await usersData.getUserById(invite.senderId);
            let inviteObjectToBeReturned = {
                id: schedule._id,
                name: schedule.name,
                creator: sender,
                events: schedule.events
            }
            invitesList.push(inviteObjectToBeReturned);
        }
        res.status(200).json(invitesList);
    }catch(e){
        res.status(500).json(e);
    }
})

/**
 * Approve Invite
 * req: {scheduleId}
 *      1. add ScheduleId to userSchedules of userId of loggedIn
 *      2. add userId to Schedule's Attendee
 *      3. Remove the Invitation from invites of userId
 */
router.put('/:scheduleId/approve', async(req,res)=>{
    try {
        //console.log(req.headers);
        const email = req.session.email;
        const scheduleId = req.params.scheduleId;
        checkEmail(email, "Email");
        checkId(scheduleId, "scheduleId");
    } catch(e) {
        return res.status(400).json({"ERROR": e});
    }
    try{
        /**
         * TODO: Validations Missing
         */
         const email = req.session.email;
         const user = await usersData.getUserByEmail(email);
         const userId = user._id.toString();
        const scheduleId = req.params.scheduleId;
        await invitesData.approveInvite(userId, scheduleId);
        res.status(200).json({"status": "Success", "message": "You have accepted the Invite"});
    }catch(e){
        res.status(400).json(e);
        console.log(e);
    }
})

/**
 * Deny the Invite
 * req: {scheduleId}
 * 1. Remove the invite from userId's invites
 */
router.put('/:scheduleId/deny',async(req,res)=>{
    try {
        //console.log(req.headers);
        const email = req.session.email;
        const scheduleId = req.params.scheduleId;
        checkEmail(email, "Email");
        checkId(scheduleId, "scheduleId");
    } catch(e) {
        return res.status(400).json({"ERROR": e});
    }
    try{
        /**
         * TODO: Validations Missing
         */
         const email = req.session.email;
         const user = await usersData.getUserByEmail(email);
         const userId = user._id.toString();
        const scheduleId = req.params.scheduleId;
        const message = await invitesData.denyInvite(userId, scheduleId);
        res.status(200).json({"status": "Success", "message": message});
    }catch(e){
        res.status(400).json(e);
    }
})

module.exports = router;