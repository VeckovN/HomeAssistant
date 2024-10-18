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
const {client:redisClient, RedisStore, } = require('./db/redis');
const upload = require('./utils/Multer.js');
const {register} = require('./controller/auth')
const { udpateHouseworker} = require('./controller/houseworkerController.js')

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
app.post('/api/houseworkerupdate', upload.any("avatar"), udpateHouseworker); //route for updating houseworker with avatar
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
        console.log("CONNECTION INITIALIZED : socketID: " + socket.id);
        const ID = socket.handshake.query.userID; //use handshake for static data

        //listen on onlineUser event (/thissocket.id could be identifier as well as userID )
        socket.on("addOnlineUser", (userData) =>{
            console.log("USERD DATA: ", userData);
            const data ={type:"Add", userID: userData.userID};
            //cleear distinction between storing user data (Hash) and tracking online users (Set).
            //for every registerd user there is HASH (user:{id} -> usenrame, password, imagePath)()
            redisClient.sadd(`onlineUsers`, userData.userID ,(err,res) =>{
                if(err){
                    console.log("Error with adding user to onlineUser set");
                }
                else{
                    console.log(`User ${userData.userID} hass been added to onlineUser set`);
                    io.emit('newOnlineUser', data);
                }
            });
        })  

        //every user on socket init join the room * used to send end receive data for concrete user
        //instead of broadcasting with io.emit('dynamicName') because it's less efficient and not good performance
        socket.on('joinRoom', (userID)=>{
            console.log("MY ID: " + ID);
            console.log("PASSED ID: " + userID);
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

        socket.on("commentNotification", (commentObj) =>{
            const houseworkerID = commentObj.newComment.houseworkerID;
            //THESE BROADCAST (NOT EFFICIENT)
            // io.emit(`privateCommentNotify-${postComment.houseworkerID}`, postComment.from);
            //emit newComment, only when the user is on the comments page
            // io.emit(`newComment-${postComment.houseworkerID}`, {postComment});

            //use JoinedRoom instead of dynamicName emit because it's broadCast the data (unnecessary traffics)
            io.to(`user:${houseworkerID}`).emit('privateCommentNotify', commentObj);
            io.to(`user:${houseworkerID}`).emit(`newCommentChange`, commentObj.newComment);
        })

        socket.on("ratingNotification", ({ratingObj}) =>{
            //emit only to user whom the message is intended
            io.emit(`privateRatingNotify-${ratingObj.houseworkerID}`, ratingObj.client);
            
        })
    

        socket.on("message", ({data})=>{ 
            try{
                console.log("MESSAGE INDEX DATA: ", data);
                const roomKey = data.roomKey;

                //THIS APPEND MESSAGE TO CHAT IF THE USER(RECIPIENT) IS IN CHAT 
                //add message to chat(users that enter the chat room(room:ID) will listen this event ro)
                io.to(roomKey).emit("messageRoom", data) //entered chat page(view)

                //Notify message recipients
                const {from, roomID, fromUsername, lastMessage, unreadMessArray} = data;
                const users = roomID.split(':');
                //exclude the sender from users notification
                const notifyUsers = users.filter(el => el!=from);

                //The user is in conversation when is this message sent -> 
                //SHOULDN'T RECEIVE NOTIFICATION AND
                notifyUsers.forEach(id =>{
                    const unreadUser = unreadMessArray.find(el => el.recipientID == id);
                    const unreadUpdateStatus = unreadUser ? unreadUser.updateStatus : null;
                    console.log("unreadUser norifyUUU: ", unreadUser);

                    const notificationData ={roomID, fromUsername, fromUserID:from, userID:id, lastMessage, unreadUpdateStatus:unreadUpdateStatus}
                    console.log("notificationData:", notificationData)
                    io.to(`user:${id}`).emit("messageResponseNotify" , notificationData);
                    //emit for listener on MessagePage(update last messages and date)
                    io.to(`user:${id}`).emit("messagePage" , data);
                })

            }
            catch(error){
                console.error("Error Handling message: ", error);
            }
        })

        socket.on("startTypingRoom", ({roomID, user}) =>{
            try{
                const {userID, username} = user;
                const roomKey = `room:${roomID}`

                const sender ={
                    senderID:userID, 
                    senderUsername:username
                }
                io.to(roomKey).emit("typingMessageStart", sender) 
                console.log(`io.to(roomKey).emit("typingMessageStart", sender) `)
            }
            catch(err){
                console.error("errpr: " , err);
            }
        })

        socket.on("stopTypingRoom", ({roomID, user}) =>{
            try{
                const {userID, username} = user;
                const roomKey = `room:${roomID}`
                console.log("STOP ROOMKEY: " + roomKey);

                const sender ={
                    senderID:userID, 
                    senderUsername:username
                }
                //send it in room (sender should check does is he sender userID === senderID and dont show (...))
                io.to(roomKey).emit("typingMessageStop", sender) 
                console.log(`io.to(roomKey).emit("typingMessageStop", sender) `)
            }
            catch(err){
                console.error("errpr: " , err);
            }
        })

        socket.on("createUserGroup", ({data}) =>{
            const {newUserID, newUsername, roomID, newRoomID, clientID ,clientUsername, newUserPicturePath} = data;                        
            //notify users
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
                io.to(`user:${id}`).emit('createUserToGroupNotify', notifyObj);
                //send data for chat room update
                io.to(`user:${id}`).emit('createUserGroupChange', data);
            })
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
                //send data for chat room update
                io.to(`user:${id}`).emit("addUserToGroupChange" , data);
            })
        })

        socket.on("kickUserFromGroup", (data) =>{
            //new roomID without kicked user
            const {newRoomID, roomID, clientID, clientUsername} = data;
            // const users = newRoomID.split(":");
            const users = roomID.split(":");
            const notifyUsers = users.filter(el => el!=clientID);

            notifyUsers.forEach(id =>{
                io.to(`user:${id}`).emit("kickUserFromGroupNotify" , data);
                io.to(`user:${id}`).emit("kickUserFromGroupChange" , data);
            });

        });

        socket.on("deleteUserRoom", (data) =>{
            const {roomID, clientID} = data;   
            const users = roomID.split(':');
            //exclude the sender from the users notification
            const notifyUsers = users.filter(el => el!=clientID);

            notifyUsers.forEach(id =>{
                //notifications
                io.to(`user:${id}`).emit("deleteUserRoomNotify" , data);
                //send data for chat room update
                io.to(`user:${id}`).emit("deleteUserRoomChange" , data);
            })
        })

        socket.on('disconnect', async()=>{
            //handshake query prop (ID) is used for disconnection.
            redisClient.srem("onlineUsers", ID, (err,res)=>{
                if(err){
                    console.log("Error with removing user from onlineUser set");
                }
                else{
                    console.log(`User ${ID} hass been removed to onlineUser set`);
                    const data ={type:"Remove", userID:ID};
                    io.emit('newOnlineUser', data);
                }
            });
        })
    })
    
    console.log("SERVER at 5000 port");
    //CRAETE - dynamic function for listener (socket, io, eventName, data)
})
