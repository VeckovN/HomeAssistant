const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
// const cookieParser = require('cookie-parser');
const clientRoute = require('./routes/clients')
const houseworkerRoute = require('./routes/houseworkers');
const authRoute = require('./routes/auth');
const dotenv = require('dotenv');
dotenv.config();

const app = express()
app.use(express.json())

//redis
const {createClient} = require("redis");
// const redis = require('redis');
const connectRedis = require('connect-redis');
// const redisClient = createClient();
const redisClient = createClient({legacyMode:true});

//RedisStore has been created and put session-object in it
// const RedisStore = connectRedis(session);
let RedisStore = require("connect-redis")(session)
//contect to redis instance
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

//Without Redis
// app.use(session({
//     resave:false,
//     saveUninitialized:false,
//     secret:process.env.SESSION_SECRET,
// }))



//#region cors
var corsOptions={
    //access is allowed to everyone
    origin:"*", //react app
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
}
app.use(cors(corsOptions));

//Cors Access Controll
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header(
//         "Access-Control-Allow-Header",
//         "Origin; X-Requested-With, Content-Type, Accept, Authorization,x-access-token , multipart/form-data"
//     );
//     if (res.method === "OPTIONS") {
//         res.header("Access-Control-Allow-Methods", "PUT, POST,PATCH, DELE, GET");
//         return res.status(200).json({});
//     }
//     next();
// });
//#endregion cors


app.listen(5000, ()=>{
    console.log("NodeJS server has been started");
})




//express-session
//To store confidential session data, we can use the express-session package.
// It stores the session data on the server and gives the client
//a session ID to access the session data. 

//cookie-parser
//cookie-parser is a middleware which parses cookies attached to the client request object.