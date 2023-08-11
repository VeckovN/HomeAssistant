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
const {client:redisClient,  sub, RedisStore, set, get, sadd, smembers, hmget, srem, zadd, exists } = require('./db/redis');
dotenv.config();
const {register} = require('./controller/auth')
// const redis = require('redis');

console.log("STATUS 2: ");
console.log(redisClient.status)


const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//multer config
app.use("/assetss", express.static(path.join(__dirname, "public/assets")));

// multer exprot and import in auth register
const storage = multer.diskStorage({
    destination: (req,file,cb) =>{
        // cb(null, "public/assets");
        cb(null, "../client/public/assets/userImages"); //store in client folder
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

var corsOptions={
    //access is allowed to everyone
    origin:"http://localhost:3000", //react app
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
}
app.use(cors(corsOptions));

// SAVE Sesssion middleware to varibale becaseu it needs to be used for socket io middleware
const sessionMiddleware = session({
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
})

//SESSION 
app.use(sessionMiddleware);

var Server = require("http").Server;
var server = Server(app);
var io = require("socket.io")(server, {
    cors: {
        origin:"http://localhost:3000", //react app
        methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
        credentials: true,
    },
    reconnection: false
    
});

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

//public data on "MESSAGE" channel 
const publish = (type, data) =>{
    const dataSent ={
        //serverid: ourServerID,
        type,
        data
    };
    //publish on MESSAGES channel
redisClient.publish("MESSAGES", JSON.stringify(dataSent));
}



(async () =>{

//taking Messages from subscriber channel
await sub.subscribe("MESSAGES", (message, channelName)=>{

    if(channelName == "MESSAGES")
    {
        console.info(message, channelName);
        const {serverid, type, data} = JSON.parse(message);

        //emit notification 
        if(type == "user.comment")
            io.emit('commentResponseNotify', data);

        if(type == 'user.rate')
            io.emit("rateResponseNotify", data);

        if(type == "user.connected")
            console.log("USER ");

        if(type == "message")
            console.log("Subscriber received a message")

        //emit signal
        //send example {user.conneced or show.room event with received data }
        io.emit(type,data);
    }
})


const ip = require('ip').address();
const port ='5000';
const ourServerID = `${ip}:${port}`


//#region Routes

//routes with files
//app.post("/api/auth/register", upload.single("picture"), register);
app.post('/api/register', upload.any("picture"), register);

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
//#endregion Routes


//FIRST WAIT ON CLIENT EVENT
//when socket connected - when user (on client) connected to app
server.listen(5000, ()=>{

    io.on('connection', async(socket)=>{
    
        //when client enter the Room 
        socket.on("room.join", id =>{ //listen on 'room.join' event
            console.log("CLIENT ENTERED THE ROOM " + id);
            socket.join(`room:${id}`); //join room -> room:1:2 example or group room:1:5:7
        })
    
        socket.on("leave.room", id =>{
            console.log("You left the room: " + id);
            socket.leave(`room:${id}`)
        })
    
        //On send comment
        //we can use socket.on because socket is instance of CLient who's send comment
        //we have to use io.on (to send to everyone)
        socket.on("comment", data=>{
            console.log("Comment received " + data);
            publish("user.comment", data);
            //io.emit('commentResponseNotify', data);
        })
    
        socket.on("message", async(messageObj)=>{    
            const parsedObj = JSON.parse(messageObj);
            const { message, from, roomID} = parsedObj;
            //ZADD {room:1:3} 1615480369 {user:1, date:1615480369, message:'Hello"}
            const date = Date.now();
            //add this propr to messageObj
            // message.date = date;
            parsedObj.date = date;
            
            //!!!!! messageOBJ is String - parse it to JSON 
            // const convertedMessage = JSON.parse(messageObj);
    
            console.log("MESSAGE OBJ: " + parsedObj);
            await sadd("online_users", from);
    
            const roomKey = `room:${roomID}`;
            console.log("ROOM: " + roomKey);
            // //roomExist its same as hasMessage
            const roomExists = await exists(roomKey);
            console.log("EE: " + roomExists);
    
            if(!roomExists){
            //or we have to create room and then send message
            //ROOM WILL BE ONLY CREATED WHEN Client send message TO HOUSEWORKER and this houseworker doesn't have room 
                //get usersID from roomID => roomID->1:2
                const usersID = roomID.split(":");//[1,2]
                // const usersMemeber = usersID.join(":"); //1:2
                //its same as roomID
                console.log("USERS IDDD: " + JSON.stringify(usersID) )
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
    
                const roomNotification={
                    id: message.roomID,
                    names:[
                        //name of users in room
                        usersID.forEach(async(id)=>{
                            await hmget(`user:${id}`, "username");
                        })
                    ]
                }
    
                publish('show.room', roomNotification);
                //broadcast to every show.room,
                //To all connected clients except the sender 
                socket.broadcast.emit('show.room', roomNotification);
            }
            //ZADD roomKey:1:2 1617197047 { "From": "2", "Date": 1617197047, "Message": "Hello", "RoomId": "1:2" }
            //ZADD Key=room:1:2 Score=1617197047 Value=obj
            const stringMessage = JSON.stringify(messageObj);
            await zadd(roomKey, date, messageObj);
            
            publish('message', messageObj);
            //notify all user in Room with roomKey emit with 'message' event
    
            //EMIT CLIENT TO JOINED CHANNEL (send message to users in Room to show when is chating )
            io.to(roomKey).emit("messageRoom", messageObj) //THIS WILL SEND SIGNAL TO CLIENT THAT IS IN ROOM
            //THIS WILL BE RECEIVED IN HOME PAGE AS NOTIFICATION FOR RECEIVED MESSAGE
            io.emit("messageResponseNotify" , messageObj);
            
            //just send users in actual room
        })
    
        //Listen on disconect event
        socket.on('disconnect', async(id)=>{
            //take userId from session (socket session in this situation)
            console.log("DISCONNECT");
    
        })
    })
    console.log("SERVER at 5000 port")
})

})(); //self invoked
