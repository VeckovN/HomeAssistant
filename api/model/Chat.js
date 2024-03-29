const { Socket } = require('socket.io');
const {incr, set, hmset, sadd, hmget, exists, client, zrevrange, zrange, smembers, zadd, srem, del, get, rename, scard} = require('../db/redis');
const { use } = require('../routes/clients');


//persist ChatApp data to Redis database

//With username(same username as in Neo4j) we got userID(same user but in redis)
//with userKey(user:{userID}) we can access to userINFO in Redis DB ()
const createUser = async(username, hashedPassword, picturePath) =>{
    try{
        const usernameKey = `username:${username}`;
        const freeID = await incr("total_users"); //total_users is data in Redis(number of users)
       
        console.log("FERTEEE IUD: " + freeID);
        const userKey = `user:${freeID}`;
    
        await set(usernameKey, userKey) //username:Novak user:1
        await hmset(userKey, ["username", username, "password", hashedPassword, "picturePath", picturePath]);
        
        return {success:true, id:freeID, username};
    }
    catch(err){
        console.log("Redis Create user Errror: " + err);
        return {success:false, message:"Error with Creating Redis User"}
    }
    
}

//Deleting a freshly created user on neo4j failed to craete the same
const deleteUserOnNeo4JFailure = async(username, userID) =>{
    try{
        const usernameKey = `username:${username}`;
        await del(usernameKey); //set delete
        const userKey = `user:${userID}`;
        await del(userKey); //hmset delete
        return {success:true, message:"User's set and hmset successfully deleted"}
    }
    catch(error){
        console.error("Redis deleting user Failed");
        return {success:false}
    }

}


const UserIdByUsername = async (username)=>{
    const user = await get(`username:${username}`); //user:{userID}
    console.log("USERRRRR : "  + user);
    let userID = user.split(':')[1]; //[user, {userID}]
    return userID
}

const usernameByUserID = async (userID)=>{
    //by default hmget returns array , but with [] descruction string will be retunred
    const [username] = await hmget(`user:${userID}`, "username")
    return username;
}

const userInfoByUserID = async(userID) =>{
    const userInfo = await hmget(`user:${userID}`, ["username","picturePath"]);
    console.log("USERRRRR INFGOOOOOOOOOO" , userInfo);
    return {username:userInfo[0], picturePath:userInfo[1]};
}

const getUserPicturePath = async(username) =>{
    const userID = await UserIdByUsername(username);
    const [picturePath] = await hmget(`user:${userID}`, "picturePath");
    return picturePath;
}

const getLastMessageFromRoom = async(roomID) =>{
    const result = await zrange(`room:${roomID}`, -1, -1);
    const parsedObj = JSON.parse(result);
    const lastMessage = parsedObj.message;
    return lastMessage;
}

//get roomIDbyUsername
const RoomId = (firstUserID, secondUserID) =>{
    //id room has to be minID:maxID --- room:1:2 room:4:9 not room:8:2
    const minUserID = firstUserID > secondUserID ? secondUserID : firstUserID;
    const maxUserID = firstUserID > secondUserID ? firstUserID : secondUserID;
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

        //Parsing JSON to obj
        const messagesObj = messages.map((mes) => JSON.parse(mes));
        console.log("MESSAGESSS : " + JSON.stringify(messagesObj) + "TP: " + typeof(messagesObj));

        return messagesObj;
    }
}

const getAllRooms = async(username)=>{
    let userID = await UserIdByUsername(username);
    const userRoomKey = `user:${userID}:rooms`;
    let rooms =[];
    rooms = await smembers(userRoomKey);

    //through every room read another userID -> 1:7 , 1:3 in this situatin 7 and 3
    var roomsArr = []
    let roomObjectArray =[];
    for(const room of rooms){
        const roomID = room;
        const userIDS = roomID.split(":");
        const otherUsers = userIDS.filter(el => el!= userID)

         //display only last messages for private rooms
         let lastMessage;
         if(otherUsers.length <= 2){
             lastMessage = await getLastMessageFromRoom(roomID);
             console.log("ROOM: " + roomID + " LastMessage: " + lastMessage);
         } 

        //DONT USE FOREACH FOR ASYNC/AWAIT ,USE for() because this will wait for async execution

        //Create promise to be ensure tha user is found and then this user push in array
        //without that this async function could be finished after pushing NOTFOUND user in array
        for(const id of otherUsers){
            const user = await userInfoByUserID(id); 
            roomObjectArray.push({username:user.username, picturePath:user.picturePath});
        }

        roomsArr.push({roomID, lastMessage, users:roomObjectArray}) //add last message
        roomObjectArray =[];
    }
    return roomsArr;
}

//With PromiseAll usage
// const getAllRooms = async (username) => {
//   let userID = await UserIdByUsername(username);
//   const userRoomKey = `user:${userID}:rooms`;
//   let rooms = [];
//   rooms = await smembers(userRoomKey);

//   // Create an array of promises for roomObjectArray
//   const roomObjectArrayPromises = rooms.map(async (room) => {
//     const roomID = room;
//     const userIDS = roomID.split(":");
//     const otherUsers = userIDS.filter((el) => el != userID);

//     // Display only last messages for private rooms
//     let lastMessage;
//     if (otherUsers.length <= 2) {
//       lastMessage = await getLastMessageFromRoom(roomID);
//       console.log("ROOM: " + roomID + " LastMessage: " + lastMessage);
//     }

//     // Use Promise.all to wait for all user info promises to resolve
//     const usersPromises = otherUsers.map(async (id) => {
//       const user = await userInfoByUserID(id);
//       return { username: user.username, picturePath: user.picturePath };
//     });

//     const users = await Promise.all(usersPromises);

//     return { roomID, lastMessage, users };
//   });

//   const roomObjectArray = await Promise.all(roomObjectArrayPromises);

//   return roomObjectArray;
// };


const addUserToRoom = async(newUsername, currentRoomID)=>{
    const newUser = await get(`username:${newUsername}`);
    const newUserID = newUser.split(":")[1] ; //user:ID 

    const currentRoomKey = `room:${currentRoomID}` //room:1:2
    const currentUserIDS = currentRoomID.split(':');

    const userPicturePath = await getUserPicturePath(newUsername);
    const isPrivateChat = currentUserIDS.length == 2 ? true :false 

    currentUserIDS.push(newUserID);
    currentUserIDS.sort((a, b) => a - b);

    let newRoomKey = "room";
    currentUserIDS.forEach(id =>{
        console.log("el: " + id);
        newRoomKey+=`:${id}`
    })
    //this is memeber of users Rooms -> user:{ID}:rooms
    const newRoomID = currentUserIDS.join(":"); 

    const newRoomKeyExists = await exists(newRoomKey);
    if(newRoomKeyExists) {
        return {roomID:null, isPrivate:isPrivateChat};
    }
    else{
        if(isPrivateChat) //client and one houseworker
        {
            //add newRoomID in their rooms(set collection)
            currentUserIDS.forEach(async(id) =>{ 
                await sadd(`user:${id}:rooms`, newRoomID);
                console.log("ID NEWWWWWWWW: " + id);
            })

            //create new roomKey and store first initial message
            const roomKey = `room:${newRoomID}`;
            const date = Date.now();
            const messageObj = JSON.stringify({message:"Chat Created", from:'Server', roomID:newRoomID})
            await zadd(roomKey, date, messageObj);
        }
        else{
            //Reinaming Room:ROOMID - sorted set for storing messages
            await rename(currentRoomKey, newRoomKey);
            //for new added user add memeber in user:{newID}:rooms
            await sadd(`user:${newUserID}:rooms`, newRoomID);

            //Replacing old roomIDs with new one.
            currentUserIDS.forEach(async(id) =>{ 
                await srem(`user:${id}:rooms`, currentRoomID);
                await sadd(`user:${id}:rooms`, newRoomID);
            })
        }
        return {roomID:newRoomID, isPrivate:isPrivateChat, newUserPicturePath:userPicturePath};
    }
}

const sendMessage = async(messageObj) =>{
    const {roomID} = messageObj;

    //ZADD {room:1:3} 1615480369 {user:1, date:1615480369, message:'Hello"}
    const date = Date.now();
    const roomKey = `room:${roomID}`;
    const roomExists = await exists(roomKey);

    if(!roomExists){
    //or we have to create room and then send message
    //ROOM WILL BE ONLY CREATED WHEN Client send message TO HOUSEWORKER and this houseworker doesn't have room 
        //get usersID from roomID => roomID->1:2
        const usersID = roomID.split(":");//[1,2]
        // const usersMemeber = usersID.join(":"); //1:2
        //its same as roomID
        const user1ID = usersID[0]; //1
        const user2ID = usersID[1]; //2
        await sadd(`user:${user1ID}:rooms`, `${roomID}`)
        await sadd(`user:${user2ID}:rooms`, `${roomID}`)

        //for more then 2 userIDs
        usersID.forEach(async(id)=>{
            await sadd(`user:${id}:rooms`, roomID);
            console.log(`user:${id}:rooms`, roomID);
        })

        // const roomNotification={
        //     id: message.roomID,
        //     names:[
        //         //name of users in room
        //         usersID.forEach(async(id)=>{
        //             await hmget(`user:${id}`, "username");
        //         })
        //     ]
        // }

        // //To all connected clients except the sender 
        // socket.broadcast.emit('show.room', roomNotification);
    }
    //ZADD roomKey:1:2 1617197047 { "From": "2", "Date": 1617197047, "Message": "Hello", "RoomId": "1:2" }
    //ZADD Key=room:1:2 Score=1617197047 Value=obj
    await zadd(roomKey, date, JSON.stringify(messageObj));

    return roomKey;
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
    userInfoByUserID,
    usernameByUserID,
    RoomId,
    createUser,
    createRoom,
    getMessages,
    getAllRooms,
    deleteRoomByRoomID,
    addUserToRoom,
    getRoomCount,
    sendMessage,
    deleteUserOnNeo4JFailure,
    getUserPicturePath
}

