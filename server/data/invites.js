const mongoCollections = require('../config/mongoCollections');
const  schedules = mongoCollections.schedules;
const  users = mongoCollections.users;
const usersData = require('../data').users;
const {ObjectId} = require('mongodb');
const validation = require('../validation');

const exportedmethods = {
    
    /**
     * Return Invites of the UserId
     * [{scheduleId:'', senderId: ''}]
     */
    async getMyInvites(email){
        let user = await usersData.getUserByEmail(email);
        return user.invites;
    },

    /**
     * *      1. add ScheduleId to userSchedules of userId of loggedIn
 *      2. add userId to Schedule's Attendee
 *      3. Remove the Invitation from invites of userId
     */
    async approveInvite(userIdStr,scheduleIdStr){
        const userData = await users();
        const scheduleData = await schedules();
        let userId = ObjectId(userIdStr);
        let scheduleId = ObjectId(scheduleIdStr);

        const newUpdatedUser = await userData.updateOne(
            {_id: userId},
            {$addToSet:{"schedules.userSchedules" : scheduleIdStr}}
        );

        const newUpdatedSchedule = await scheduleData.updateOne(
            {_id: scheduleId},
            {$addToSet:{"attendees" : userIdStr }}
        );

        const newUpdatedInvites = await userData.updateOne(
            {_id: userId},
            { $pull: { "invites" : { "scheduleId": scheduleIdStr } } }
        );

        return ;
    },

    async denyInvite(userId, scheduleId){
        const userData = await users();
        const newUpdatedInvites = await userData.updateOne(
            {_id: ObjectId(userId)},
            { $pull: { "invites" : { "scheduleId": scheduleId } } }
        );

        if(newUpdatedInvites.modifiedCount === 0) return `User - ${userId} Doesn't have matching invite - ${scheduleId}`;
        else return `User - ${userId} Denied the invite - ${scheduleId}`;
    }
}
module.exports = exportedmethods;
