const {incr, set, hmset, sadd, hmget, exists, zrange, smembers, zadd, zrangerev, srem, del, get, rename, scard} = require('../db/redis');
const formatDate = require('../utils/dateUtils');


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

// Format room ID to start with the lower user ID value
const getRoomIdInOrder = (firstUserID, secondUserID) =>{
     // The room ID should be formatted as minID:maxID (e.g., room:1:2, room:4:9, not room:8:2)
    const minUserID = firstUserID > secondUserID ? secondUserID : firstUserID;
    const maxUserID = firstUserID > secondUserID ? firstUserID : secondUserID;
    // Generate the room ID in the format minID:maxID between two users
    return `${minUserID}:${maxUserID}`
}

//When Client want to send message to Houseworker ,we have to create
//room between them and communicate in that room
const createRoom = async(firstUsername, secondUsername)=>{

    const firstUserID = UserIdByUsername(firstUsername);
    const secondUserID = UserIdByUsername(secondUsername);

    console.log("FirstUserID: " , firstUserID);
    console.log("secondUserID: " , secondUserID);
    

    //get iid of users ---- user:1 , user:3  --> roomID is 1:3
    const usersRoomID = getRoomIdInOrder(firstUserID, secondUserID);

    console.log("userRommID : ", usersRoomID);


    if(usersRoomID === null){
        //users not exists
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
const getMessages = async(roomID, offset, size) =>{
    // console.log("OFFSET : " + offset + " SIZE: " + size);
    // const size = 10;

    //from offset to size--> 0 to 10 -> 11 elements
    const roomKey = `room:${roomID}`;
    const roomExists = await exists(roomKey)
    if(!roomExists)
        return null;

    const messages = await zrangerev(roomKey, offset, size -1);
    // const messages = latestMessages.reverse();

    const messagesObj = messages.map((mes) => JSON.parse(mes)); //Parsing JSON to obj
    return messagesObj;
}

//offset calculated based on pageNumber and size(defined)
const getMoreMessages = async(roomID, pageNumber) =>{

    console.log("ROOOOOOOOOOMMMMMMMMM: " + roomID);
    console.log("PAGE NUUUUUUMMMMMMMMM: " + pageNumber);

    const size = 10;
    const offset = size * pageNumber;
    //od offset do size
    const endIndex = offset + size -1; 

    //pNUmber =0 => offset = 10 * 0 -> from 0 index element
    //pNUmber =0 => lastE = 0 + 10 -1 -> to 9 index element

     //pNUmber =1 => offset = 10 * 1 -> from 10 index element
    //pNUmber =1 => lastE = 10 + 10 -1 -> to 19 index element
 
    const roomKey = `room:${roomID}`;
    const roomExists = await exists(roomKey)
    if(!roomExists)
        return null;

    const messages = await zrangerev(roomKey, offset, endIndex);
    // const messages = latestMessages.reverse();

    console.log("MWWSSS: ", messages);

    const messagesObj = messages.map((mes) => JSON.parse(mes)); //Parsing JSON to obj
    return messagesObj;
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
    const timestamps = Date.now(); //used for score value (miliseconds)
    const date = new Date(timestamps); //obj that contains 
    const dateFormat = formatDate(date);

    const newRoomKeyExists = await exists(newRoomKey);
    //but this newRoomKey have contain rooms id in order -> 1:42:311 not 1:311:42

    console.log("NEW ROOM KEY ESIXYTS : " , newRoomKeyExists);

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
            const messageObj = JSON.stringify({message:"Chat Created", from:'Server', date:dateFormat, roomID:newRoomID})
            await zadd(newRoomKey, timestamps, messageObj);
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

            // const roomKey = `room:${newRoomID}`;
            const messageObj = JSON.stringify({message:`User ${newUsername} has been added to the chat`, from:'Server', date:dateFormat, roomID:newRoomID})
            await zadd(newRoomKey, timestamps, messageObj);
        }
        return {
            newAddedUserID:newUserID,
            roomID:newRoomID, 
            isPrivate:isPrivateChat, 
            newUserPicturePath:userPicturePath
        };
    }
}

const removeUserFromRoomID = async(roomID, username) =>{
    const user = await get(`username:${username}`);
    const userID = user.split(":")[1] ; //'user':ID 

    const currentRoomKey = `room:${roomID}` //room:1:2
    const currentUserIDS = roomID.split(':');

    const newIds = currentUserIDS.filter(id => id !== userID);
    const newRoomID = newIds.join(":");
    const newRoomKey = `room:${newRoomID}`

    //if newRoomKey exist (group with same members)
    //make newRoomKey to be unique to avoid conflict with same roomID
    const newRoomKeyExists = await exists(newRoomKey);
    // if(newRoomKeyExists){
        //DELETE THIS CHAT IF CHAT ALREADY EXIST WITH SAME MEMBERS(remained memebers)
    //     newRoomKey +=":new1";
    //     newRoomID +=":new1";
    // }

    
    //(FOR REMOVED USER)
    //-find set `user:${userID}:rooms` and remove roomID from that set
    await srem(`user:${userID}:rooms`, roomID);

    //FOR OTHER MEMBERS (replace the old RoomID with new one)
    newIds.forEach(async(id) =>{ 
        await srem(`user:${id}:rooms`, roomID);
        await sadd(`user:${id}:rooms`, newRoomID);
    })

    //find sorted set and remove user from it (id) room:3:6:22:123 where messages are stored
    await rename(currentRoomKey, newRoomKey);

    //Store Server message (user {username} is kicked from the chat)
    const timestamps = Date.now(); //used for score value (miliseconds)
    const date = new Date(timestamps); //obj that contains 
    const dateFormat = formatDate(date);
    const messageObj = JSON.stringify({message:`User ${username} has been kicked from the chat`, from:'Server', date:dateFormat, roomID:newRoomID})
    await zadd(newRoomKey, timestamps, messageObj);

    return {
        newRoomID, 
        kickedUserID:userID
    };
}
 
const sendMessage = async(messageObj) =>{
    const {roomID} = messageObj;

    //ZADD {room:1:3} 1615480369 {user:1, date:formattedDate, message:'Hello"}
    const roomKey = `room:${roomID}`;
    const roomExists = await exists(roomKey);

    const timestamps = Date.now(); //used for score value (miliseconds)
    const date = new Date(timestamps); //obj that contains 
    const dateFormat = formatDate(date);
    const newMessageObj = {...messageObj, date:dateFormat};

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
    await zadd(roomKey, timestamps, JSON.stringify(newMessageObj));
    return {roomKey, dateFormat};
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
    getRoomIdInOrder,
    createUser,
    createRoom,
    getMessages,
    getMoreMessages,
    getAllRooms,
    deleteRoomByRoomID,
    addUserToRoom,
    removeUserFromRoomID,
    getRoomCount,
    sendMessage,
    deleteUserOnNeo4JFailure,
    getUserPicturePath
}

