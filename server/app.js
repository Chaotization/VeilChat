const express = require('express');
const app = express();
const configRoutes = require('./routes');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
var path = require('path');
const { decodeToken } = require('./middleware');
const server = require('http').createServer(express);
const io = require('socket.io')(server);

const port = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.use(cors());


app.use(session({
  name: 'AuthCookie',
  resave: false,
  secret: "Secert",
  saveUninitialized: true
})
);

/**
 * Dummy Validation of session
 */


var public = path.join(__dirname, '/public');
app.use("/public", express.static(public));
/**
 * Middleware Functionality for validating the token
 */
app.use('/invites*', decodeToken);
app.use('/schedules', decodeToken);
app.use('/login', decodeToken);
app.use('/signup', decodeToken);
app.use('/changeUserPW', decodeToken);
app.use('/changeUserInfo', decodeToken);

app.use(async (req, res, next) => {
  let date = new Date().toUTCString();
  let authStr;
  if(!req.session.email){
      authStr = "(Non-Authenticated User)";
  }else{
      authStr = "(Authenticated User)";
  }
  console.log(`[${date}]: ${req.method} ${req.originalUrl} ${authStr}`);
  next();
});

io.on('connection', (socket) => {
  console.log('new client connected', socket.id);

  socket.on('user_join', ({name, room}) => {
    console.log('A user joined ' + room + ' their name is ' + name);
    socket.join(room);
    socket.to(room).emit('user_join', {name, room});
  });

  socket.on('message', ({name, message, room}) => {
    console.log(name, message, socket.id);
    io.to(room).emit('message', {name, message});
  });

  socket.on('disconnect', () => {
    console.log('Disconnect Fired');
  });
});

configRoutes(app);

app.listen(port, ()=>{
  console.log(`We've now got a server! on port ${port}`);

});
