const mongoCollections = require('../config/mongoCollections');
const  schedules = mongoCollections.schedules;
const {ObjectId} = require('mongodb');
const  users  = require('./users');
const validation = require('../validation');
const fs = require('fs');
const path = require('path')

/**
 * 1. New Schedule created and inserted 
 * 2. Update the User's owned Schedule with schedule Id created above
 */
const exportedMethods = {
    async getAllSchedules(){
        const scheduleCollection = await schedules();
        return await scheduleCollection.find({}).toArray();
    },

    async addSchedule(name,creatorId,attendees,events){
       
        creatorId = validation.checkId(creatorId,'CreatorID');
        name = validation.checkString(name, 'name');
        attendees = validation.checkAttendees(attendees);
        events = validation.checkEvents(events);
      
        const scheduleCollection = await schedules();

        const userThatPosted = await users.getUserById(creatorId);
        if(userThatPosted === undefined || userThatPosted === null) throw "User not found with the id";

        const newSchedule = {
            name: name,
            creator: creatorId,
            attendees: attendees,
            events: events,
            chat: []
        }
        const newInsertInformation = await scheduleCollection.insertOne(newSchedule);
        const newId = newInsertInformation.insertedId;
        if(newId !== undefined){
            let {_id, schedules} = userThatPosted;
            schedules.ownedSchedules.push(newId.toString());
           await  users.updateUser(_id.toString(),userThatPosted);
        }
        return await this.getScheduleById(newId.toString());
    },

    async getScheduleById(id){
        id = validation.checkId(id,'ID');
        const scheduleCollection = await schedules();
        const schedule = await scheduleCollection.findOne({_id: ObjectId(id)});

        if(!schedule) throw 'Schedule not found.';
        return schedule;
    },

    async updateSchedule(id, updatedSchedule) {
        id = validation.checkId(id, 'id');
        updatedSchedule.name = validation.checkString(
            updatedSchedule.name,
            'Schedule Name'
        );
        updatedSchedule.creatorId = validation.checkId(
            updatedSchedule.creatorId, 
            'Creator ID'
        );

        let scheduleUpdateInfo = {
            name: updatedSchedule.name,
            creator: updatedSchedule.creatorId,
            attendees: updatedSchedule.attendees,
            events: updatedSchedule.events,
            chat: updatedSchedule.chat
        };

        const scheduleCollection = await schedules();
        const updateInfo = await scheduleCollection.updateOne(
            {_id: ObjectId(id)},
            {$set: scheduleUpdateInfo}
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed.';

        return await this.getScheduleById(id);
    },

    async getEvent(scheduleID, eventID) {
        scheduleID = validation.checkId(scheduleID, "Schedule ID");
        eventID = validation.checkString(eventID, "Event ID");

        const scheduleCollection = await schedules();
        const event = await scheduleCollection.findOne({_id: ObjectId(scheduleID)}, {projection: {events: {$elemMatch: {name: eventID}}}});

        if (!event) throw `Error: Event not found`;

        return event.events[0];
    },

    async createEvent(userID, scheduleID, name, description, cost, startTime, endTime, image){
        userID = validation.checkEmail(userID, "User ID");
        scheduleID = validation.checkId(scheduleID, "Schedule ID");
        name = validation.checkString(name, "Event Name");
        description = validation.checkString(description, "Event Description");
        cost = validation.checkCost(cost, "Cost");
        startTime = validation.checkDate(startTime, "Start Time");
        endTime = validation.checkDate(endTime, "End Time");
        if (endTime < startTime) throw `Error: End time must come after start time!`;
        image = validation.checkString(image, "Image name");

        const scheduleCollection = await schedules();

        const schedule = await this.getScheduleById(scheduleID);
        if(schedule === undefined || schedule === null) throw "Schedule not found with the id";

        for (let event of schedule.events) {
            if(name === event.name) throw "Events in the same schedule cannot have the same name";
        }

        const userThatPosted = await users.getUserByEmail(userID);
        if(userThatPosted === undefined || userThatPosted === null) throw "User not found with the id";
        if(schedule.creator != userThatPosted._id) throw `User is not the creator of the schedule!`;

        const newEvent = {
            name: name,
            description: description,
            cost: cost,
            startTime: startTime.getTime(),
            endTime: endTime.getTime(),
            attendees: [],
            image: image
        }

        const updateInfo = await scheduleCollection.updateOne(
            {_id: ObjectId(scheduleID)},
            {$push: {events: newEvent}}
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

        return this.getScheduleById(scheduleID);
    },

    async updateEvent (userID, scheduleID, eventID, name, description, cost, startTime, endTime, attendees, image) {
        userID = validation.checkEmail(userID, "User ID");
        scheduleID = validation.checkId(scheduleID, "Schedule ID");
        eventID = validation.checkString(eventID, "Event ID");

        const scheduleCollection = await schedules();

        const schedule = await this.getScheduleById(scheduleID);
        if(schedule === undefined || schedule === null) throw "Schedule not found with the id";

        const userThatPosted = await users.getUserByEmail(userID);
        if(userThatPosted === undefined || userThatPosted === null) throw "User not found with the id";
        if(!schedule.attendees.includes(userID) && !(schedule.creator == userThatPosted._id.toString())) throw `User is not invited to the schedule!`;

        const oldEvent = await this.getEvent(scheduleID, eventID);
        
        if (name && name != 'undefined') {
            name = validation.checkString(name, "Event Name");
        }else {
            name = oldEvent.name;
        }
        if (description && description != 'undefined') {
            description = validation.checkString(description, "Event Description");
        }else {
            description = oldEvent.description;
        }
        if(cost && cost != 'undefined') {
            cost = validation.checkCost(cost, "Cost");
        }else {
            cost = oldEvent.cost;
        }
        if(startTime && startTime != 'undefined') {
            startTime = new Date(startTime);
            startTime = validation.checkDate(startTime, "Start Time");
        }else {
            startTime = oldEvent.startTime;
        }
        if(endTime && endTime != 'undefined') {
            endTime = new Date(endTime);
            endTime = validation.checkDate(endTime, "End Time");
        }else {
            endTime = oldEvent.endTime;
        }
        if (endTime < startTime) throw `Error: End time must come after start time!`;
        if(attendees){
            for (let x in attendees) {
                attendees[x] = validation.checkEmail(attendees[x],"Attendees");
            }
        }else {
            attendees = oldEvent.attendees;
        }
        if(image) {
            image = validation.checkString(image, 'Image name')
            try{
                fs.unlink(path.join(__dirname, '../public/images/'+oldEvent.image), (err) => {
                    if (err) {
                        console.log(err);
                    }
                
                    console.log("Delete old image successfully.");
                });
            }catch(e){
                console.log(e)
            }
        }else {
            image = oldEvent.image
        }


        const updatedEvent = {
            name: name,
            description: description,
            cost: cost,
            startTime: startTime,
            endTime: endTime,
            attendees: attendees,
            image: image
        }

        const updateInfo = await scheduleCollection.updateOne(
            {_id: ObjectId(scheduleID), "events.name": eventID},
            {$set: {"events.$": updatedEvent}}
        );

        if (!updateInfo.matchedCount && !updateInfo.modifiedCount) throw 'Update failed';

        return this.getScheduleById(scheduleID);
    },

    async addAttendee(scheduleId, userId){
        scheduleId = validation.checkId(scheduleId, 'Schedule Id');
        userId = validation.checkId(userId, 'User Id');

        const schedule = await this.getScheduleById(scheduleId);
        if(schedule === undefined) throw "Schedule not found";
        const scheduleCollection = await schedules();
        await scheduleCollection.updateOne({_id: ObjectId(scheduleId)}, { $addToSet: {attendees: userId}});
    },
}




module.exports = exportedMethods;

