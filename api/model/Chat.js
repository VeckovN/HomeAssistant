const { Socket } = require('socket.io');
const {incr, set, hmset, sadd, hmget, exists, client, zrevrange, smembers, zadd, srem, del, get, rename, scard} = require('../db/redis');
const { use } = require('../routes/clients');


//persist ChatApp data to Redis database

//With username(same username as in Neo4j) we got userID(same user but in redis)
//with userKey(user:{userID}) we can access to userINFO in Redis DB ()
const createUser = async(username, hashedPassword) =>{
    const usernameKey = `username:${username}`;
    const freeID = await incr("total_users"); //total_users is data in Redis(number of users)
   
    console.log("FERTEEE IUD: " + freeID);
    const userKey = `user:${freeID}`;

    await set(usernameKey, userKey) //username:Novak user:1
    await hmset(userKey, ["username", username, "password", hashedPassword]);
    //intialise his rooms on empty
    // await sadd(`user:${freeID}:rooms`, ``)


    // //With username we got userID
    // //with userKey(user:{userID}) we can access to userINFO in Redis DB ()
    return {id:freeID, username};
}

const UserIdByUsername = async (username)=>{
    //for test

    const user = await get(`username:${username}`); //user:{userID}
    console.log("USERRRRR : "  + user);
    let userID = user.split(':')[1]; //[user, {userID}]
    return userID
}

const usernameByUserID = async (userID)=>{
    const username = await hmget(`user:${userID}`, "username")
    console.log("USERNAME " + username);
    return username;
    
}

//get roomIDbyUsername
const RoomId = (firstUserID, secondUserID) =>{
    //id room has to be minID:maxID --- room:1:2 room:4:9 not room:8:2
    const minUserID = firstUserID > secondUserID ? secondUserID : firstUserID;
    const maxUserID = firstUser > secondUserID ? firstUserID : secondUserID;
    //get roomID Between 2 users --- user1 and user4 room:1:4
    return `${minUserID}:${maxUserID}`
}

//When Client want to send message to Houseworker ,we have to create
//room between them and communicate in that room
const createRoom = async(firstUsername, secondUsername)=>{

    const firstUserID = getUserIdByUsername(firstUsername);
    const secondUserID = getUserIdByUsername(secondUsername);

    //get iid of users ---- user:1 , user:3  --> roomID is 1:3
    const usersRoomID = getRoomId(firstUserID, secondUserID);

    if(usersRoomID === null){
        //users not exists
        // return [null, true] //no users , 
        return null;
    }
    //create rooms
    //user:{userID}:room room:{minUser}:{maxUser}
    await sadd(`user:${firstUserID}:rooms`, `${usersRoomID}`)
    await sadd(`user:${secondUserID}:rooms`, `${usersRoomID}`)

    //return created room id and names of users
    return [{
        id:usersRoomID,
        //get names from hashed sets ("username" Field)
        names:[
            await hmget(`user:${firstUserID}`, "username"),
            await hmget(`user:${secondUserID}`, "username")
        ]
    }]
}


//get message From ---  ZREVRANGE room:{roomID} {offset_start} {offset_end}
// ZREVRANGE room:1:2 0 50 (will return 50 messages with 0 offsets for the private room between users with IDs 1 and 2.)
const getMessages = async(roomID, offset=0, size=50) =>{
    const roomKey = `room:${roomID}`;
    const roomExists = await exists(roomKey)
    if(!roomExists)
        return null;
    else{

        //return all messages from room
        console.log("TTTTTT" + roomID + " " + offset + " " + size);
        const ReMessages = await zrevrange(roomKey, offset, size);
        const messages = ReMessages.reverse();

        // console.log("MESSAGES: " + messages + "TP: " + typeof(messages));
        //username of sender
        // const mess = messages)

        let messagesObj = [];
        for(const mes of messages){
            // console.log("EL :" + mes);
            const mesObj = JSON.parse(mes);
            //for each user return their username
            const username = await usernameByUserID(mesObj.from);
            //console.log("username: " + username + "TP: " + JSON.stringify(username))
            mesObj.fromUsername = username[0];
            // console.log('MESOBJ ' + JSON.stringify(mesObj));
            messagesObj.push(mesObj);
        }
        // const from = mess.from;
        // console.log("FROM: " + from);
        // const fromUsername = await usernameByUserID(from);

        // console.log("USERNAME: " + fromUsername);
        // messages.fromUsername = fromUsername;
        console.log("MESSAGESSS : " + JSON.stringify(messagesObj) + "TP: " + typeof(messagesObj));

        return messagesObj;
        // //return message by message
    }
}

const getAllRooms = async(username)=>{
    console.log("TESS");
    
    let userID = await UserIdByUsername(username);
    console.log("TESSS2");
    const userRoomKey = `user:${userID}:rooms`;
    let rooms =[];
    rooms = await smembers(userRoomKey);

    //through every room read another userID -> 1:7 , 1:3 in this situatin 7 and 3

    var roomsArr = []
    let usernames =[];
    for(const room of rooms){
        const roomID = room;
        const userIDS = roomID.split(":");
        console.log("ROOM ID" + roomID + '\n');
        //ourID = userID;
        //return diferent userID then our

        const otherUsers = userIDS.filter(el => el!= userID)

        console.log("OTHER USERS: " + otherUsers);

        //const otherUser = userIDS[0] == userID ? userIDS[1] : userIDS[0];


        //DONT USE FOREACH FOR ASYNC/AWAIT 
        //USE for() because this will wait for async execution

        //Create promise to be ensure tha user is found and then this user push in array
        //without that this async function could be finished after pushing NOTFOUND user in array
        for(const id of otherUsers){
            console.log("EL :" + id);
            //for each user return their username
            const user = await usernameByUserID(id);
            console.log("USERTTTTTTTTT: "+ user);
            usernames.push(user);
        }

        roomsArr.push({roomID, users:usernames});
        usernames=[]; //reset -for other rooms
    }

    // const roomsArr = rooms.map( async el =>{
    //     const roomID = el;
    //     const userIDS = roomID.split(":");
    //     console.log("ROOM ID" + roomID);
    //     //ourID = userID;
    //     //return diferent userID 
    //     const otherUser = userIDS[0] == userID ? userIDS[1] : userIDS[0];
    //     console.log("\n OHTER: " + otherUser); 
    //     // //get username by userID in Redis
    //     const user = await usernameByUserID(otherUser);
    //     console.log("USERRNAMEEE : " + user);
    //     return {roomID, user}
    // })


    console.log("OTH" + JSON.stringify(roomsArr));
    return roomsArr;
}

//this will be exected on socket event socket.on('message') event
//-Who send Message --- message.from (user:1)
//-Where is message sent ---message.roomID, (room:1:3)
//-What is sent --- message.message, (hello)
//message = {from, message, roomID, }
// const sendMessage = async(messageObj) =>{
// }

//add user to create group chat
const addUserToRoom = async(newUsername, currentRoomID)=>{

    const newUser = await get(`username:${newUsername}`);
    const newUserID = newUser.split(":")[1] ; //user:ID 

    //this will change(extend) existing user room 
    //and create that updated room to new user
    const currentRoomKey = `room:${currentRoomID}` //room:1:2
    // console.log("CURRENT ROOM: " + currentRoomID)
    const currentUserIDS = currentRoomID.split(':');
    //add newUserID
    currentUserIDS.push(newUserID)
    const sortedUserIDS = currentUserIDS.sort();
    // console.log("currentUserIDS : " + currentUserIDS); 
    // console.log("newUSERID: " + newUserID);

    let newRoomKey = "room";
    sortedUserIDS.forEach(id =>{
        console.log("el: " + id);
        newRoomKey+=`:${id}`
    })

    //this is memeber of users Rooms -> user:{ID}:rooms
    const newRoomID = sortedUserIDS.join(":"); //sorted ids with : between them =-- 1:2:5
    console.log("NEW USERS ID VALUE: " + newRoomID);
    //Put newUserID in order way   //allway order as room:1:5:9 not room:1:9:5
    console.log("SADD: " + `user:${newUserID}:rooms` + "," +  newRoomID)    

    // //rename currentRoomKey room:1:2 to room:1:2:newUser  (sorted set which store messages)
    await rename(currentRoomKey, newRoomKey);
    //for new added user add memeber in user:{newID}:rooms
    await sadd(`user:${newUserID}:rooms`, newRoomID);

    // console.log("SADD: " + `user:${newUserID}:rooms` + "," +  newRoomID)
    // console.log("RENAME: " + currentRoomKey + "," + newRoomKey)

    const oldUsersIDS = currentRoomID.split(':');
    const oldRoomID = currentRoomID;
    oldUsersIDS.forEach(async(id) =>{ 
        await srem(`user:${id}:rooms`, currentRoomID);
        console.log("SREM : " + `user:${id}:rooms` + "," + oldRoomID )
        //add IDS of users seperated with : ----> 1:2:5
        await sadd(`user:${id}:rooms`, newRoomID);
        console.log("AWAIT SADD: " + `user:${id}:rooms` + "," +  newRoomID)
    })

}

const getRoomCount = async(userID)=>{
    const userKey = `user:${userID}:rooms`;
    const count = await scard(userKey);
    return count;
}

//or we could create Group Room on start conversation
const createGroupRoom = async(userIDS)=>{ //array of usersID [1,2,6]
    const userIDMemeber = userIDS.join(":"); // 1:2:6 ids seperated with :
    //add member (userIDS) in each userRooms -> user:{userID}:rooms
    userIDS.forEach(async (id) =>{
        await sadd(`user:${id}:rooms`, userIDMemeber)
    })
    const roomKey = `room:${userIDMemeber}`;
    await zadd(roomKey); //just create empty sorted list
}

const deleteRoomByRoomID = async(roomID) =>{
    const roomKey = `room:${roomID}`;
    //find users with this ids and delete room from theri rooms set
    const usersID = roomID.split(':');
    usersID.forEach(async id =>{
        console.log("USER KEY : " + `user:${id}:rooms` + "ROOMID: " + roomID);
        //delete memeber(RoomID) from user set user:{USERID}:rooms
       await srem(`user:${id}:rooms`, roomID); //delte example memeber 1:2 in user:1:rooms 
    })
    //Delete sorted Set which contains all messages in ROOM
    await del(`room:${roomID}`);

}




module.exports ={
    UserIdByUsername,
    RoomId,
    createUser,
    createRoom,
    getMessages,
    getAllRooms,
    deleteRoomByRoomID,
    addUserToRoom,
    getRoomCount
}

