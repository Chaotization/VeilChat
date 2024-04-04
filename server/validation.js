const {ObjectId} = require('mongodb');

module.exports = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== 'string') throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
  },

  checkString(strVal, varName) {
    if (!strVal || strVal == 'undefined') throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
  },

  checkPassword(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    if (strVal.length < 6)
      throw `Error: ${varName} must be at least 6 characters long`;
    return strVal;
  },

  checkStringArray(arr, varName) {
    //We will allow an empty array for this,
    //if it's not empty, we will make sure all tags are strings
    let arrayInvalidFlag = false;
    if (!arr || !Array.isArray(arr))
      throw `You must provide an array of ${varName}`;
    for (let i in arr) {
      if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) {
        arrayInvalidFlag = true;
        break;
      }
      arr[i] = arr[i].trim();
    }
    if (arrayInvalidFlag)
      throw `One or more elements in ${varName} array is not a string or is an empty string`;
    return arr;
  },

  checkCost(num, varName) {
    if (num == null) throw `Error: You must supply a ${varName}!`;
    if (isNaN(num)) throw `Error: ${varName} must be a number!`;
    if (num < 0) throw `Error: ${varName} must be greater than or equal to zero!`;
    return num;
  },

  checkDate(date, varName) {
    if(!date) throw `Error: You must supply a ${varName}!`;
    if(!(Object.prototype.toString.call(date) === "[object Date]")) throw `Error: ${varName} must be a valid date!`;
    if (isNaN(date)) throw `Error: ${varName} is an invalid date!`;
    const now = new Date();
    if (date < now) throw `Error: ${varName} cannot be before now!`;

    return date;
  },

  checkEmail(email, varName) {
    if (!email) throw `Error: You must supply a ${varName}!`;
    if (typeof email !== 'string') throw `Error: ${varName} must be a string!`;
    email = email.trim();
    if (email.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(email))
      throw `Error: ${email} is not a valid value for ${varName} as it only contains digits`;
    const regexExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
    if(!regexExp.test(email))
      throw `Error: ${email} is not a valid email format`;
    return email;
  },

  checkAttendees(attendees) {
    if (!Array.isArray(attendees)) attendees = [];
    if (attendees.length === 0) return attendees;
    attendees.forEach((e) => {
      this.checkEmail(e, "AttendeesId");
    });

    return attendees;
  },

  checkEvents(events) {
    if (!Array.isArray(events)) {
      events = [];
    }
    if (events.length !== 0) {
      events.forEach((e) => {
        let { eventId, name, description, cost, startTime, endTime, attendees } = e;
        eventId = this.checkId(eventId, 'event Id');
        name = this.checkString(name, "event name");
        description = this.checkString(description, "event description");
        if(cost === undefined || cost === null) throw "cost has to be provided";
        if(isNaN(cost)) throw "cost has to be a number value";
        //validation required for start time and end time
        endTime = new Date(endTime);
        startTime = new Date(startTime);
        this.checkDate(endTime);
        this.checkDate(startTime);
        if(startTime > endTime) throw "end date has to be greater than start date";
        attendees = this.checkAttendees(attendees);
      });
    }
    return events;
  },

};