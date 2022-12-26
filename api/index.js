const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
// const cookieParser = require('cookie-parser');
const clientRoute = require('./routes/clients')
const houseworkerRoute = require('./routes/houseworkers');
const authRoute = require('./routes/auth');
const dotenv = require('dotenv');
const {client:redisClient, RedisStore, set } = require('./db/redis');
dotenv.config();

const app = express()
app.use(express.json())


//redis
// const {createClient} = require("redis");
// const redisClient = createClient({legacyMode:true});
// //RedisStore has been created and put session-object in it
// // const RedisStore = connectRedis(session);
// let RedisStore = require("connect-redis")(session)
// //contect to redis instance
// redisClient.connect()
// .catch(err=>{
//     console.log("Couldn't connect to redis", err);
// })

redisClient.connect()
.catch(err=>{
    console.log("Couldn't connect to redis", err);
})


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
        secure:false, //if false - any HTTP call which is NOT HTTPS and it doesn't have SSL can access our cookies(can access this app in general)
        httpOnly: false, //if true - the  web page can't access the cookie in JS
        maxAge: 1000* 60 * 10, //session max age in ms 
    }
}))

// app.use(express.urlencoded({ extended: false }))
// parse application/json
// app.use(express.json())

//don't needed for newest express-session version
// app.use(cookieParser());


//routes
app.use("/api/clients", clientRoute);
app.use("/api/homeworker", houseworkerRoute);
app.use("/api/" , authRoute);
app.get("/api/", (req,res)=>{
    console.log("PS");
    console.log("SESSSSSLogion3333333333333: " + JSON.stringify(req.session))
    if(req.session.user)
        // return res.redirect(`/${req.session.user.type}`) // /client or /houseworker
       return res.send("Session works")
       
    return res.send("Session doesen't works")
        
})

var corsOptions={
    //access is allowed to everyone
    origin:"*", //react app
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
}
app.use(cors(corsOptions));


//SocketIO 
const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server).listen(server);
//const io = require("socket.io")(server);

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
const port ='5000';
const serverID = `${ip}:${port}`
console.log("IP:" + ip);

//public data on "MESSAGE" channel
const publish = (type, data) =>{
    const dataSent ={
        serverID,
        type,
        data
    };
    redisClient.publish("MESSAGES", JSON.stringify(dataSent));
}

//every client is subscribed to this channel ("MESSAGE")
//to receive notification when is message received (to roomID)
//example when sent message
//publish("Message",messageOBJ);
//io.to(roomKey).emit("message", message); //message sent to roomKey=>room:${roomID} 
//and emit to everyone which listen 'message' channel
const initPubSub = () =>{
    //if 
    redisClient.on('message', (_, message)=>{
        //dont handle pub/sub message if the server is the same
        const {serverid , type, data } = JSON.parse(message);
        if(serverID === serverid)
            return
        io.emit(type, data); //this emit 'data' to every member of changel 'type'
    });

}

//when socket 
io.on('connection', (socket)=>{
    console.log("SOCKET: " + socket.id)
})


// io.use() allows you to specify a function that is called for every new, incoming socket.io connection. 
// It can be used for a wide variety of things such as: 
// Logging,Authentication,Managing sessions,Rate limiting,Connection validation
// io.use((socket, next)=>{

// })
//const dataNOtSplited = "username:Novak"
//data.split(":") --- ["username", "Novak"]
//data[0] -> "username", data[1] => "Novak"
//How Data flows


//SET for usernameKEy with userIDKey because we ony have username prop from Neo4j(without userID)
//usernameKEy = `username:{$username}` ---username:Novak
//userID is generated as total_users +1 
//userKey = `user:{$userID}` user:1
//set(usernameKey, userKey) --- username:Novak user:1   (KEY: username:"Novak" VALUE: user:"1")


//HMSET --HASED SET Betweeen KEY: UserKEY, VALUES: Username and password
//hmset(userKey, ["username", username, "password", hassedPassword])
// ---- user:1 ["username" ,"Novak", "password", "Wjk1h28as8$!@1231312"]


//ROOMS --- USER COULD HAVE ROOM (1 to 1) OR GROUP ROOMS (1 to many)
//KEY---user:{$userID}:rooms,  VALUE---"{roomID}" 
//user:{$userID}:rooms "{roomID}" // for 1 to 1 (room:1:3 ->room between user:1 and user:3) 
//or Group chat (room:1 which 1 is a indetifier of group example(mainRoom -> 1), or room:2 (babysitters -> 2) )
//SADD key member [member ...]
//sadd(`user:{userID}:rooms`, `${roomID}`) --roomID is added to user with 
//EXAMPLE ()
//user:Novak has userID => user:1
//user:Sara has userID => user:3
//user:1:rooms romm:1:3  (room between user:1 and user:3 added to user:1 roomSET)
//also user:2 must have room:1:3 in his roomSet
//user:3:rooms room:1:3

//OR GROUP ROOM
//user:Vlada has userID =>user:6
//user:Marko has userID =>user:11
//user:Novak has userID =>user:1
//add roomID to into usersRooms
//user:6:rooms room:1:6:11 //That means room of 3 users
//user:11:rooms room:1:6:11
//user:1:rooms room:1:6:11
//NOW user 6 send message to this Room (RoomID:1:6:11 Where KEY room:1:6:11)


//HOW TO ADD MESSAGE TO ROOM
//WHEN user:1 to user:2 send message this will be sent in room:1:3
//But we have to know order sending/receiving message to show on proper order
//we could use ZADD Set which will SORT message base on timestamp

//ZADD {roomID} timestamp {from ,date, mesasge}
//user:1 send message to user:3 --> room:1:3
//ZADD {room:1:3} 1615480369 {user:1, date:1615480369, message:'Hello"}



//express-session
//To store confidential session data, we can use the express-session package.
// It stores the session data on the server and gives the client
//a session ID to access the session data. 

//cookie-parser
//cookie-parser is a middleware which parses cookies attached to the client request object.