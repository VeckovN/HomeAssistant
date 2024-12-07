const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const {client:redisClient, RedisStore, } = require('./db/redis');
const upload = require('./utils/Multer.js');
const {register} = require('./controller/auth')
const { udpateHouseworker} = require('./controller/houseworkerController.js')
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

//static assets
app.use("/assetss", express.static(path.join(__dirname, "public/assets")));

var corsOptions={
    origin:"http://localhost:3000", //react app
    methods: "POST, PUT, GET, HEAD, PATCH, DELETE",
    credentials: true,
}
app.use(cors(corsOptions));

const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    resave:false, 
    saveUninitialized:false,
    name:"sessionLog",
    secret: "aKiqn12$%5s@09~1s1",
    cookie:{
        //for deploy set the secure to TURE, TURE DONSN'T STORE COOKIE ON BROWSER in DEVELOPMENT(using postman and etc.)
        secure:false, //our cookies works wiht false -if false - any HTTP call which is NOT HTTPS and it doesn't have SSL can access our cookies(can access this app in general)
        httpOnly: true, //if true - the  web page can't access the cookie in JS
        maxAge: 1000 * 95 * 10, 
    }
})
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

//File upload routes
app.post('/api/register', upload.any("avatar"), register);
app.post('/api/houseworkerupdate', upload.any("avatar"), udpateHouseworker); //route for updating houseworker with avatar

//Api routes
app.use("/api/clients", clientRoute);
app.use("/api/houseworker", houseworkerRoute);
app.use("/api/", authRoute);
app.use('/api/chat', chatRoute);

//#endregion Routes

server.listen(5000, ()=>{
    console.log("SERVER at 5000 port");
    
    io.on('connection', async(socket)=>{
        console.log("CONNECTED INTITIALIZED: socketID: " + socket.id);
        listeners(io, socket, redisClient);
    })
})
