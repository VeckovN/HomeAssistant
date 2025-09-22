const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const {client:redisClient, RedisStore, } = require('./db/redis');
const listeners = require('./sockets/listeners');

const clientRoute = require('./routes/clients')
const houseworkerRoute = require('./routes/houseworkers');
const authRoute = require('./routes/auth');
const chatRoute = require('./routes/chat');

dotenv.config();

const app = express();

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload());

var corsOptions={
    origin: process.env.CLIENT_URL,
    methods: "POST, PUT, GET, HEAD, PATCH, DELETE",
    credentials: true,
}
app.use(cors(corsOptions));

const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    resave:false, 
    saveUninitialized:false,
    name:"sessionLog",
    secret: process.env.SESSION_SECRET,
    cookie:{
        secure: process.env.NODE_ENV === "production",
        httpOnly: true, //if true - the  web page can't access the cookie in JS
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 95 * 10, 
    }
})
app.use(sessionMiddleware);

//Socket Server Init
var Server = require("http").Server;
var server = Server(app);

var io = require("socket.io")(server, {
    cors: {
        origin:process.env.CLIENT_URL, //react app
        methods: ["POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD"],
        credentials: true,
    },
    reconnection: false
});

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

//Api routes
app.use("/api/clients", clientRoute);
app.use("/api/houseworker", houseworkerRoute);
app.use("/api/", authRoute);
app.use('/api/chat', chatRoute);

server.listen(5000, ()=>{
    console.log("SERVER at 5000 port");
    
    io.on('connection', async(socket)=>{
        console.log("CONNECTED INTITIALIZED: socketID: " + socket.id);
        listeners(io, socket, redisClient);
    })
})
