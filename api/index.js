const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const clientRoute = require('./routes/clients')
const houseworkerRoute = require('./routes/houseworkers');
const authRoute = require('./routes/auth');
const chatRoute = require('./routes/chat');
const dotenv = require('dotenv');
const path = require('path');
const {sendMessage} = require('./model/Chat.js')
const {client:redisClient, RedisStore} = require('./db/redis');
const upload = require('./utils/Multer.js');
const {register, uploadNewPicture} = require('./controller/auth')
dotenv.config();


const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//multer config
app.use("/assetss", express.static(path.join(__dirname, "public/assets")));

var corsOptions={
    //access is allowed to everyone
    origin:"http://localhost:3000", //react app
    methods: "POST, PUT, GET, HEAD, PATCH, DELETE",
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
        httpOnly: true, //if true - the  web page can't access the cookie in JS
        maxAge: 1000 * 95 * 10, //session max age in ms
    }
})
//SESSION 
app.use(sessionMiddleware);


//Socket Server Init
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

//#region Routes

//app.post("/api/auth/register", upload.single("picture"), register);
//app.post('/api/register', upload.any("picture"), register);
app.post('/api/register', upload.any("avatar"), register);
app.use("/api/clients", clientRoute);
app.use("/api/houseworker", houseworkerRoute);
app.use("/api/" , authRoute);
app.use('/api/chat', chatRoute);

app.get("/api/", (req,res)=>{
    console.log("SESSSSSLogion3333333333333: " + JSON.stringify(req.session))
    if(req.session.user)
        // return res.redirect(`/${req.session.user.type}`) // /client or /houseworker
       return res.send("Session works")
    return res.send("Session doesen't works")  
})
//#endregion Routes


server.listen(5000, ()=>{
    io.on('connection', async(socket)=>{
        console.log("CONNECTION INITIALIZED");

        //every user on socket init join the room * used to send end receive data for concrete user
        //instead of broadcasting with io.emit('dynamicName') because it's less efficient and not good performance
        socket.on('joinRoom', (userID)=>{
            socket.join(`user:${userID}`);
            console.log(`\n User with ID ${userID} joined the room user-${userID} \n`)
        })

        socket.on('leaveRoom', userID =>{
            console.log(`User with ID ${userID} left the room user-${userID}`)
            socket.leave(`user:${userID}`);
        })


        //Chat rooms
        socket.on("chatRoom.join", id =>{ //listen on 'room.join' event
            console.log("CLIENT ENTERED THE ROOM " + id);
            socket.join(`room:${id}`); //join room -> room:1:2 example or group room:1:5:7
        })
    
        socket.on("chatRoom.leave", id =>{
            console.log("You left the room: " + id);
            socket.leave(`room:${id}`)
        })

        //REFFACTORED
        socket.on("commentNotification", (postComment) =>{
            //THESE BROADCAST (NOT EFFICIENT)
            // io.emit(`privateCommentNotify-${postComment.houseworkerID}`, postComment.from);
            //emit newComment, only when the user is on the comments page
            // io.emit(`newComment-${postComment.houseworkerID}`, {postComment});

            //use JoinedRoom instead of dynamicName emit because it's broadCast the data (unnecessary traffics)
            io.to(`user:${postComment.houseworkerID}`).emit('privateCommentNotify', postComment.from);
            io.to(`user:${postComment.houseworkerID}`).emit(`newCommentChange`, {postComment});
        })

        socket.on("ratingNotification", ({ratingObj}) =>{
            console.log("RATING OBJ " + JSON.stringify(ratingObj));
            //emit only to user whom the message is intended
            io.emit(`privateRatingNotify-${ratingObj.houseworkerID}`, ratingObj.client);
            
        })
    
        // Refactored
        socket.on("message", ({data})=>{ 
            try{
                const roomKey = data.roomKey;
                //add message to chat(users that enter the chat room(room:ID) will listen this event ro)
                io.to(roomKey).emit("messageRoom", data) //entered chat page(view)

                //Notify message recipients
                const {from, roomID, fromUsername} = data;
                const users = roomID.split(':');
                //exclude the sender from users notification
                const notifyUsers = users.filter(el => el!=from);
                notifyUsers.forEach(id =>{
                    io.to(`user:${id}`).emit("messageResponseNotify" , fromUsername);
                })

            }
            catch(error){
                console.error("Error Handling message: ", error);
            }
        })


        socket.on("createUserGroup", ({data}) =>{
            //JUST EMIT ON createUSerGroupChange for newUserID
            //this event is listen on Message page (only when the user enter the page)
            io.to(`user:${data.newUserID}`).emit('createUserGroupChange', data);
            
            //notify only new added user
            //This event is listen on Socket connection
            io.to(`user:${data.newUserID}`).emit('createUserToGroupNotify', data);
        })

        socket.on("addUserToGroup", ({data}) =>{
            const {newUserID, newUsername, roomID, newRoomID, clientID ,clientUsername, newUserPicturePath} = data;

            const users = newRoomID.split(':');
            //exclude the sender from the users notification
            const notifyUsers = users.filter(el => el!=clientID);

            const notifyObj = {
                newHouseworkerID:newUserID, 
                clientUsername: clientUsername, 
                newHouseworkerUsername:newUsername
            }

            notifyUsers.forEach(id =>{
                //notifications
                io.to(`user:${id}`).emit("addUserToGroupNotify" , notifyObj);
                console.log(`io.to(user:${id}).emit("addUserToGroupNotify" , notifyObj)`);

                //send data for chat room update
                io.to(`user:${id}`).emit("addUserToGroupChange" , data);
                console.log(`io.to(user:${id}).emit("addUserToGroupChange" , data);`)
            })
        })
    
        socket.on('disconnect', async(id)=>{
            console.log("DISCONNECT");
        })
    })

    console.log("SERVER at 5000 port")
})
