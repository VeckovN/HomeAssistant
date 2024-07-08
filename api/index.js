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

        socket.on("room.join", id =>{ //listen on 'room.join' event
            console.log("CLIENT ENTERED THE ROOM " + id);
            socket.join(`room:${id}`); //join room -> room:1:2 example or group room:1:5:7
        })
    
        socket.on("leave.room", id =>{
            console.log("You left the room: " + id);
            socket.leave(`room:${id}`)
        })

        socket.on("commentNotification", ({postComment}) =>{
            //emit only to user whom the message is intended
            console.log("COMMENT SEND TO : " + postComment.houseworkerID)
            console.log("CCM: " , postComment);
            console.log(`privateCommentNotify-${postComment.houseworkerID} : ${postComment.client}`)
            io.emit(`privateCommentNotify-${postComment.houseworkerID}`, postComment.client);
        })

        socket.on("ratingNotification", ({ratingObj}) =>{
            console.log("RATING OBJ " + JSON.stringify(ratingObj));
            //emit only to user whom the message is intended
            io.emit(`privateRatingNotify-${ratingObj.houseworkerID}`, ratingObj.client);
            
        })
    
        socket.on("message", ({data})=>{ 
            try{
                const roomKey = data.roomKey;
                io.to(roomKey).emit("messageRoom", data)
                io.emit("messageResponseNotify" , data);
            }
            catch(error){
                console.error("Error Handling message: ", error);
            }
        })
    
        socket.on('disconnect', async(id)=>{
            console.log("DISCONNECT");
        })
    })

    console.log("SERVER at 5000 port")
})
