const scheduleRoutes = require('./schedules');
const inviteRoutes = require('./invites');
const usersRoutes = require('./users');

const constructorMethod = (app) => {
    app.use('/schedules', scheduleRoutes);  
    app.use('/invites', inviteRoutes);
    app.use('/', usersRoutes);
    app.use('*', (req,res) => {
        res.sendStatus(404);
    });
};

module.exports = constructorMethod;