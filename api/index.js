const express = require('express');
const cors = require('cors');


const clientRoute = require('./routes/clients')

const neo4jSession = require('./db/neo4j');

const app = express();

app.use("/api/clients", clientRoute);
app.use(express.json());

//#region cors
var corsOptions={
    //access is allowed to everyone
    origin:"*"
}
app.use(cors(corsOptions));

//Cors Access Controll
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Header",
        "Origin; X-Requested-With, Content-Type, Accept, Authorization,x-access-token , multipart/form-data"
    );
    if (res.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST,PATCH, DELE, GET");
        return res.status(200).json({});
    }
    next();
});

//#endregion cors






app.listen(5000, ()=>{
    console.log("NodeJS server has been started");
})

