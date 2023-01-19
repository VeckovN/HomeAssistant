const { Socket } = require('socket.io');
const {incr, set, hmset, sadd, hmget, exists, client, zrevrange, smembers, zadd, srem, del, get} = require('../db/redis');
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
        const messages = await zrevrange(roomKey, offset, size)
        console.log("MESSAGESSS : " + JSON.stringify(messages));

        return messages;
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

    for(const room of rooms){
        const roomID = room;
        const userIDS = roomID.split(":");
        console.log("ROOM ID" + roomID);
        //ourID = userID;
        //return diferent userID 
        const otherUser = userIDS[0] == userID ? userIDS[1] : userIDS[0];
        console.log("\n OHTER: " + otherUser); 
        // //get username by userID in Redis
        const user = await usernameByUserID(otherUser);
        console.log("USERRNAMEEE : " + user);

        roomsArr.push({roomID, user});
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
//-What is send --- message.message, (hello)
//message = {from, message, roomID, }
// const sendMessage = async(messageObj) =>{
// }

//add user to create group chat
const addUserToRoom = async(newUserID, currentRoomID)=>{
    //this will change(extend) existing user room 
    //and create that updated room to new user
    const currentRoomKey = `room:${currentRoomID}` //room:1:2
    //values of userID should be sorted 
    const newRoomKey = `${currentRoomKey}:${newUserID}`; //room:1:2:3
    const newUserIds = `${currentRoomID}:${newUserID}`;

    //rename currentRoomKey room:1:2 to room:1:2:newUser  (sorted set which store messages)
    await rename(currentRoomKey, newRoomKey);
    //create user:{newUserID}:rooms
    await sadd(`user:${newUserID}:rooms`, newUserIds);

    //in user:1:rooms and user:2:rooms add new memeber 1:2:newUserID
    const usersID = currentRoomID.split(':'); //array with userID
    //for each user add new memeber 
    usersID.forEach(async(id) =>{ 
        //add IDS of users seperated with : ----> 1:2:5
        await sadd(`user:${id}:rooms`, newUserIds);
    })

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
        await srem(`user:${id}:rooms`, roomID); //delte example memeber 1:2 in user:1:rooms 
    })
    //Del will remove the key entirely
    await del(`room:${roomID}`);
}


module.exports ={
    UserIdByUsername,
    RoomId,
    createUser,
    createRoom,
    getMessages,
    getAllRooms   
}

