const { Socket } = require('socket.io');
const {incr, set, hmset, sadd, hmget, exists, client, zrevrange, smembers, zadd, srem, del} = require('../db/redis');
const { use } = require('../routes/clients');

//persist ChatApp data to Redis database

//With username(same username as in Neo4j) we got userID(same user but in redis)
//with userKey(user:{userID}) we can access to userINFO in Redis DB ()
const createUser = async(username, hashedPassword) =>{
    const usernameKey = `username:${username}`;
    const freeID = await incr("total_users"); //total_users is data in Redis(number of users)
    const userKey = `user:${freeID}`;

    await set(usernameKey, userKey) //username:Novak user:1
    await hmset(userKey, ["username", username, "password", hashedPassword]);
    //With username we got userID
    //with userKey(user:{userID}) we can access to userINFO in Redis DB ()
    return {id:freeID, username};
}

const UserIdByUsername = (username)=>{
    const user = get(`username:${username}`); //user:{userID}
    const userID = user.split(':')[1]; //[user, {userID}]
    return userID
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
        const messages = await zrevrange(roomID, offset, size)
        messages.map(msg => JSON.parse(msg));
    }
}

const getAllRooms = async(username)=>{
    const userID = getUserIdByUsername(username);
    const userRoomKey = `user:${userID}:rooms`;
    const rooms =[];
    rooms = await smembers(userRoomKey);
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

