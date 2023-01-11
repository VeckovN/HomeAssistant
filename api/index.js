const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const clientRoute = require('./routes/clients')
const houseworkerRoute = require('./routes/houseworkers');
const authRoute = require('./routes/auth');
const chatRoute = require('./routes/chat');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const {client:redisClient, RedisStore, set, sadd, smembers, hmget, srem } = require('./db/redis');
dotenv.config();
const {register} = require('./controller/auth')

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//multer config
app.use("/assets", express.static(path.join(__dirname, "public/assets")));


// multer exprot and import in auth register
const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        cb(null, "public/assets");
    },
    filename: (req, file, cb) =>{
        cb(null, Date.now() + '_' + file.originalname)
        //cb(null, file.originalname)
    }
});
const upload = multer({storage:storage});

app.use((error, req, res, next) => {
    console.log('This is the rejected field ->', error.field);
});

// //Route With files(Multer)
// app.post("/api/auth/register", upload.single("picture"), register);
// //upload image
// app.post("/api/update/picture", upload,single("picture"), updatePicture);

//redis
redisClient.connect()
.catch(err=>{
    console.log("Couldn't connect to redis", err);
})

var corsOptions={
    //access is allowed to everyone
    origin:"http://localhost:3000", //react app
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
}
app.use(cors(corsOptions));


//with Redis
app.use(session({
    store: new RedisStore({ client: redisClient }),
    //if false = we don't re-save the session, so we are not saving the same object every time
    resave:false, 
    //if false =we only want to create session when the user is logged in (We saving something in session only when is user logged in)
    //if true = session will be created even user not logged in ()
    saveUninitialized:false,
    name:"sessionLog",
    secret: "aKiqn12$%5s@09~1s1",
    cookie:{
        //for deploy set the secure to TURE, TURE DONSN'T STORE COOKIE ON BROWSER in DEVELOPMENT(using postman and etc.)
        secure:false, //our cookies works wiht false -if false - any HTTP call which is NOT HTTPS and it doesn't have SSL can access our cookies(can access this app in general)
        httpOnly: false, //if true - the  web page can't access the cookie in JS
        maxAge: 1000* 60 * 10, //session max age in ms 
    }
}))

//routes with files
//app.post("/api/auth/register", upload.single("picture"), register);



app.post('/api/register', upload.any("picture"), register);

//routes
app.use("/api/clients", clientRoute);
app.use("/api/houseworker", houseworkerRoute);
app.use("/api/" , authRoute);
app.use('/api/chat', chatRoute);

app.get("/api/", (req,res)=>{
    console.log("PS");
    console.log("SESSSSSLogion3333333333333: " + JSON.stringify(req.session))
    if(req.session.user)
        // return res.redirect(`/${req.session.user.type}`) // /client or /houseworker
       return res.send("Session works")
       
    return res.send("Session doesen't works")  
})


//SocketIO 
const http = require('http');
// const socketio = require('socket.io');
const {Server} = require('socket.io');
const { getAllRooms } = require('./model/Chat');
const server = http.createServer(app);
// const io = socketio(server).listen(server);
const io = new Server(server);

//when client connected (on client side) this will be  triggered

server.listen(5000, ()=>{
    console.log("SERVER at 5000 port")
})
//this is replaced
// app.listen(5000, ()=>{
//     console.log("NodeJS server has been started");
// })

//Unique serverID -> Combination of IpAddress:Port
//THis Could be in .env
const ip = require('ip').address();
// const port ='5000';
const port ='5000';
const serverID = `${ip}:${port}`
console.log("IP:" + ip);

//public and subscribe initialization
redisClient.on("message", (_,message)=>{
    const {idServer, type, data} = JSON.parse(message);
    //serverID is unique for every server (serverIPAddress+port)
    if(serverID === idServer)
        return;
    io.emit(type, data);
})
//every client is subscriber

//!!!!!!FIX IT
//Error: ERR Can't execute 'get': only (P)SUBSCRIBE / (P)UNSUBSCRIBE / PING / QUIT are allowed in this context
//redisClient.subscribe('MESSAGES');

//public data on "MESSAGE" channel
const publish = (type, data) =>{
    const dataSent ={
        serverID,
        type,
        data
    };
redisClient.publish("MESSAGES", JSON.stringify(dataSent));
}

//we have this socket connection (front) -(back)
// socket.off("user.connected");
// socket.off("user.disconnected");
// socket.off("user.room");
// socket.off("message");


//FIRST WAIT ON CLIENT EVENT
//when socket connected - when user (on client) connected to app
io.on('connection', async(socket)=>{
    console.log('user connected');

    //socket session is connected as redis session
    const userInfo = socket.request.session.user;
    const username = userInfo.username;
    //user:{id}
    const userIDKey = await get(`username:${username}`)
    const userID = userIDKey.split(':')[1]; //{id}

    //add him in online users
    await sadd('online_users', userID);


    //use redis publish to notify all subscribers that user is connected
    //publish function or client.publish
    redisClient.publish('user.connected', 'msg');
    //use socket() to broadcast emit(real-time) TO NOTIFY FRONTEND
    socket.broadcast.emit('user.contected', 'msg');

    //if client trigger event room.join then
    socket.on("room.join", id =>{ //listen on 'room.join' event
        socket.join(`room:${id}`); //join room -> room:1:2 example or group room:1:5:7
    })


    //WHERE CLIENT SEND MESSAGE(ON FRONT SIDE) TAKE THIS MESSAGE AND USE IT IN BACK HERE
    //listten on message event(if client send message)
    //we take message from client(message) and persist it to REDIS 
    //then notify other subscirber of THAT CHANNEL(room) to see sent message
    //in client --- (socekt.emit('message', {messageObj}))
    //that trigger this event
    socket.on("message", async(messageObj)=>{    
        const { message, from, roomID} = messageObj;
        //ZADD {room:1:3} 1615480369 {user:1, date:1615480369, message:'Hello"}
        const date = Date.now();
        //add this propr to messageObj
        message.date = date;
        console.log("MESSAGE OBJ: " + JSON.stringify(message));
        //add user to online users //when is loggouted or session expired then remove it from this set
        await sadd("online_users", message.from);

        const roomKey = `room:${roomID}`;
        //roomExist its same as hasMessage
        const roomExists = await exists(roomKey);

        if(!roomExists){
        //or we have to create room and then send message
        //ROOM WILL BE ONLY CREATED WHEN Client send message TO HOUSEWORKER and this houseworker doesn't have room 
            //get usersID from roomID => roomID->1:2
            const usersID = roomID.split(":");//[1,2]
            // const usersMemeber = usersID.join(":"); //1:2
            //its same as roomID
            console.log("USERS IDDD: " + usersID + " MEMEBER: " + usersMemeber);
            const user1ID = usersID[0]; //1
            const user2ID = usersID[1]; //2
            console.log("USERS: " + user1ID + "/ " + user2ID);
            await sadd(`user:${user1ID}:rooms`, `${roomID}`)
            await sadd(`user:${user2ID}:rooms`, `${roomID}`)

            //for more then 2 userIDs
            usersID.forEach(async(id)=>{
                // await sadd(`user:${id}:rooms`, usersMemeber);
                await sadd(`user:${id}:rooms`, roomID);
                console.log(`user:${id}:rooms`, roomID);
            })

            //structrure to send for showroom notification
            const roomNotification={
                id: message.roomID,
                names:[
                    //name of users in room
                    usersID.forEach(async(id)=>{
                        await hmget(`user:${id}`, "username");
                    })
                ]
            }
            //send data to subscriber of room
            //msg contains roomID and usernames in this room, in client(from) we will read roomID and show msg only in this room
            publish('show.room', roomNotification);
            //broadcast to every show.room,
            //To all connected clients except the sender 
            socket.broadcast.emit('show.room', roomNotification);
        }
        //ZADD roomKey:1:2 1617197047 { "From": "2", "Date": 1617197047, "Message": "Hello", "RoomId": "1:2" }
        //ZADD Key=room:1:2 Score=1617197047 Value=obj
        const stringMessage = JSON.stringify(messageObj);
        await zadd(roomKey, date, stringMessage);
        
        publish('message', messageObj);
        //notify all user in Room with roomKey emit with 'message' event
        io.to(roomKey).emit("message", messageObj) //THIS WILL SEND SIGNAL TO CLIENT
        //just send users in actual room
    })

    //Listen on disconect event
    socket.on('disconnect', async()=>{
        //TEST THIS
        //take userId from session (socket session in this situation)
        const userID = socket.request.session.user.username;
        //remove user from online_users set
        await srem("online_users", userID);
        const status = {
            ...socket.request.session.user,
            online:false
        }
        //notify users that disconnection is done
        publish("user.disconected", status);
        socket.broadcast.emit("user.disconnected", status);

    })

})









// io.use() allows you to specify a function that is called for every new, incoming socket.io connection. 
// It can be used for a wide variety of things such as: 
// Logging,Authentication,Managing sessions,Rate limiting,Connection validation
// io.use((socket, next)=>{

// })


//express-session
//To store confidential session data, we can use the express-session package.
// It stores the session data on the server and gives the client
//a session ID to access the session data. 

//cookie-parser
//cookie-parser is a middleware which parses cookies attached to the client request object.