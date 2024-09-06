const {incr, set, hmset, sadd, hmget, exists, zrange, smembers, zadd, zrangerev, srem, del, get, rename, scard} = require('../db/redis');
const {formatDate, parseFormattedDate, calculateTimeDifference} = require('../utils/dateUtils');
const { getUserIdByUsername, getUserInfoByUserID, getUserPicturePath, getUnreadMessageCountByRoomID} = require('../db/redisUtils');


//With username(same username as in Neo4j) we got userID(same user but in redis)
//with userKey(user:{userID}) we can access to userINFO in Redis DB ()
const createUser = async(username, hashedPassword, picturePath) =>{
    try{
        const usernameKey = `username:${username}`;
        const freeID = await incr("total_users"); //total_users is data in Redis(number of users)
    
        const userKey = `user:${freeID}`;
    
        await set(usernameKey, userKey) //username:Novak user:1
        await hmset(userKey, ["username", username, "password", hashedPassword, "picturePath", picturePath]);
        
        return {success:true, id:freeID, username};
    }
    catch(err){
        console.error("Redis Create user Errror: " + err);
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

const getLastMessageFromRoom = async(roomID) =>{
    const result = await zrange(`room:${roomID}`, -1, -1);
    const parsedObj = JSON.parse(result);
    const currentDate = parsedObj.date;
    const difference = calculateTimeDifference(currentDate);
    const lastMessage  = {message:parsedObj.message, dateDiff:difference}
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
    const firstUserID = getUserIdByUsername(firstUsername);
    const secondUserID = getUserIdByUsername(secondUsername);

    //get iid of users ---- user:1 , user:3  --> roomID is 1:3
    const usersRoomID = getRoomIdInOrder(firstUserID, secondUserID);

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
    const messagesObj = messages.map((mes) => JSON.parse(mes)); //Parsing JSON to obj
    return messagesObj;
}

const getAllRooms = async(username)=>{
    let userID = await getUserIdByUsername(username);
    const userRoomKey = `user:${userID}:rooms`;
    let rooms = await smembers(userRoomKey);

    //Get online users and create 6set for efficeint lookups(could be massive)
    const onlineUsers = await smembers(`onlineUsers`);
    const onlineUsersSet = new Set(onlineUsers);

    //through every room read another userID -> 1:7 , 1:3 in this situatin 7 and 3
    var roomsArr = []
    var unreadRoomMessages;
    var unreadMess = [];
    // console.log("\n rooms: ", rooms);
    for(const roomID of rooms){
        unreadRoomMessages = {};
        // console.log("RoomMMMMMM: ", roomID);
        // console.log("userID: ", userID);
        const userIDS = roomID.split(":");
        const otherUsers = userIDS.filter(el => el!= userID)
        const lastMessage = await getLastMessageFromRoom(roomID);

        //get unread messages if exists
        // const unreadObjKey =`user${userID}:room:${roomID}:unread`
        // const unreadCount = await hmget(unreadObjKey, "count");
        // const countNumber = Number(unreadCount);
        const countNumber = await getUnreadMessageCountByRoomID(userID, roomID);
        if(countNumber)
        {
            console.log("!!!!!!!");
            unreadRoomMessages = {
                roomID:roomID,
                count:countNumber
            }
            const obj ={
                roomID:roomID,
                count:countNumber,

            }
            unreadMess.push(obj);
            console.log("unreadMess:", unreadMess , "\n");
        }
        // console.log("unreadOBJ: ", countNumber + "\n");
        
        //DONT USE FOREACH FOR ASYNC/AWAIT ,USE for() because this will wait for async execution
        //Create promise to be ensure tha user is found and then this user push in array
        //without that this async function could be finished after pushing NOTFOUND user in array
        let roomObjectArray =[];
        for(const id of otherUsers){ //group users
            const user = await getUserInfoByUserID(id); 
            roomObjectArray.push({
                userID:id,
                username:user.username, 
                picturePath:user.picturePath,
                online: onlineUsersSet.has(id) //not required for chat component -> replaced by checking onlineUsers state
            });
        }


        roomsArr.push({roomID, lastMessage, users:roomObjectArray}) //add last message
        // roomsArr.push({roomID, lastMessage, users:roomObjectArray, unread:unreadRoomMessages})
        console.log("ROOMARRRR : ", unreadRoomMessages);
        
    }

    const roomsObj = {rooms:[...roomsArr], unread:unreadMess}
    return roomsObj;
    // return roomsArr;
}
// const getAllRooms = async(username)=>{
//     let userID = await getUserIdByUsername(username);
//     const userRoomKey = `user:${userID}:rooms`;
//     let rooms =[];
//     rooms = await smembers(userRoomKey);


//     //through every room read another userID -> 1:7 , 1:3 in this situatin 7 and 3
//     var roomsArr = []
//     let roomObjectArray =[];
//     for(const room of rooms){
//         const roomID = room;
//         const userIDS = roomID.split(":");
//         const otherUsers = userIDS.filter(el => el!= userID)
//         //maybe here get onlineUsers


//          //display only last messages for private rooms
//          let lastMessage;
//          if(otherUsers.length <= 2){
//              lastMessage = await getLastMessageFromRoom(roomID);
//              console.log("ROOM: " + roomID + " LastMessage: " + lastMessage);
//          } 

//         //DONT USE FOREACH FOR ASYNC/AWAIT ,USE for() because this will wait for async execution

//         //Create promise to be ensure tha user is found and then this user push in array
//         //without that this async function could be finished after pushing NOTFOUND user in array
//         for(const id of otherUsers){
//             const user = await getUserInfoByUserID(id); 
//             roomObjectArray.push({username:user.username, picturePath:user.picturePath});
//         }

//         roomsArr.push({roomID, lastMessage, users:roomObjectArray}) //add last message
//         roomObjectArray =[];
//     }
//     return roomsArr;
// }

//With PromiseAll usage
// const getAllRooms = async (username) => {
//   let userID = await getUserIdByUsername(username);
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
//       const user = await getUserInfoByUserID(id);
//       return { username: user.username, picturePath: user.picturePath };
//     });

//     const users = await Promise.all(usersPromises);

//     return { roomID, lastMessage, users };
//   });

//   const roomObjectArray = await Promise.all(roomObjectArrayPromises);

//   return roomObjectArray;
// };

const getOnlineUsersFromChat = async(userID) =>{
    //set to manage unique users IDs(automatically)
    const usersFromRoomSet = new Set();

    const usersRoomKey = `user:${userID}:rooms`;
    const usersRoomsIDS = await smembers(usersRoomKey);
    usersRoomsIDS.forEach(id => {
        const membersIds = id.split(':');
        membersIds.forEach(memberID => {
            usersFromRoomSet.add(memberID);
        })
    })

    // Convert the Set back to an array (IF NEEDED)
    const uniqueUserIds = Array.from(usersFromRoomSet);
    // This approach works well even if onlineUsers is massive(with set->filter and has methods)
    const onlineUsers = await smembers(`onlineUsers`);
    const onlineUsersSet = new Set(onlineUsers); // O(1) average time complexity
    const onlineRoomUsers = Array.from(usersFromRoomSet).filter(user => onlineUsersSet.has(user))
    
    return onlineRoomUsers
}

const getFriendsListByUserID = async(userID) =>{
    const usersFromRoomSet = new Set();

    const usersRoomKey = `user:${userID}:rooms`;
    const usersRoomsIDS = await smembers(usersRoomKey);
    usersRoomsIDS.forEach(id => {
        const membersIds = id.split(':');
        membersIds.forEach(memberID => {
            usersFromRoomSet.add(memberID);
        })
    })

    // const uniqueUserIds = Array.from(usersFromRoomSet);
    const friendsList = Array.from(usersFromRoomSet);
    return friendsList;
}



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
        newRoomKey+=`:${id}`
    })
    //this is memeber of users Rooms -> user:{ID}:rooms
    const newRoomID = currentUserIDS.join(":"); 
    const timestamps = Date.now(); //used for score value (miliseconds)
    const date = new Date(timestamps); //obj that contains 
    const dateFormat = formatDate(date);

    const newRoomKeyExists = await exists(newRoomKey);
    //but this newRoomKey have contain rooms id in order -> 1:42:311 not 1:311:42

    if(newRoomKeyExists) {
        return {roomID:null, isPrivate:isPrivateChat};
    }
    else{
        if(isPrivateChat) //client and one houseworker
        {
            //add newRoomID in their rooms(set collection)
            currentUserIDS.forEach(async(id) =>{ 
                await sadd(`user:${id}:rooms`, newRoomID);
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
    if(newRoomKeyExists){
        return{
            newRoomID:null, 
            kickedUserID:userID
        }
    }
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
    const {roomID, from} = messageObj;
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
        })
    }

    await postUnreadMessagesToUser(roomID, from);
    await zadd(roomKey, timestamps, JSON.stringify(newMessageObj));
    return {roomKey, dateFormat};
}

const postUnreadMessagesToUser = async(roomID, senderUserID) =>{
    const userIDFromRoom = roomID.split(":").filter(id => id != senderUserID);
    
    userIDFromRoom.forEach(async(id)=>{
        const unreadMessKey =`user${id}:room:${roomID}:unread`
        let countNumber = await getUnreadMessageCountByRoomID(id, roomID);
        console.log("\n unreaDMESSKEYT: ", unreadMessKey);
        console.log("\n COUNT NUMBER: " , countNumber);
        
        if(countNumber)
            countNumber = countNumber + 1;
        else
            countNumber = 1;

        console.log("AFTER COUNT NUM INCREASING OR SETING ON 1 : " , countNumber)

        // await hmset(unreadMessKey, ["last_received_timestamp", timestamps, "count", countNumber, "sender", from]);
        await hmset(unreadMessKey, ["count", countNumber, "sender", senderUserID]);

    })
}

const getUnreadMessages = async(username) =>{
    let userID = await getUserIdByUsername(username);
    const userRoomKey = `user:${userID}:rooms`;
    let rooms = await smembers(userRoomKey);

    var unreadRoomMessages;
    var unreadMessageArray = [];
    let totalCount = 0;
    for(const roomID of rooms){
        unreadRoomMessages = {};
        // console.log("RoomMMMMMM: ", roomID);
        // console.log("userID: ", userID);

        //get unread messages if exists
        // const unreadObjKey =`user${userID}:room:${roomID}:unread`
        // const unreadCount = await hmget(unreadObjKey, "count");
        // const countNumber = Number(unreadCount);
        const countNumber = await getUnreadMessageCountByRoomID(userID, roomID);
        if(countNumber)
        {
            const obj ={
                roomID:roomID,
                count:countNumber,
                // sender:userID
            }
            unreadMessageArray.push(obj);
            totalCount += countNumber;
            console.log("unreadMess:", unreadMessageArray , "\n");
        }
        console.log("ROOMARRRR : ", unreadRoomMessages);
    }

    const unreadMessageObj = {unread:unreadMessageArray, totalUnread:totalCount}
    return unreadMessageObj;
}

//when user click on room with unread messages
const resetUnreadMessagesCount = async(roomID, userID) =>{
    try{
        const unreadMessKey = `user${userID}:room:${roomID}:unread`
        await del(unreadMessKey);
        return {status:"success"};
    }
    catch(err){
        console.error("Redis reset unread message count Errror: " + err);
        return {success:false, message:"Error with reseting unread message"}
    }
}

const getUnreadMessagesTotalCount = async(userID) =>{
    try{
        const userRoomKey = `user:${userID}:rooms`;
        let rooms = await smembers(userRoomKey);

        let totalCount = 0;
        for(const roomID of rooms){
            const countNumber = await getUnreadMessageCountByRoomID(userID, roomID);
            if(countNumber)
                totalCount += countNumber;
        }

        return totalCount;
    }
    catch(err){
        console.error("Redis get unread messages count Errror: " + err);
        return {success:false, message:"Error with reseting unread message"}
    }
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
    usersID.forEach(async id =>{s
       await srem(`user:${id}:rooms`, roomID); //delte example memeber 1:2 in user:1:rooms 
    })
    //Delete sorted Set which contains all messages in ROOM
    await del(`room:${roomID}`);

}


//ITS MORE EFFICIENT TO ADD NEW SER FOR EACH USERS -> ChatMembers 
//After adding users to group(chat) -> add it to this set and every user will have list of theirs users ids
//INSTEAD OF EXTRACTING memebers from users rooms ids.

module.exports ={
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
    getOnlineUsersFromChat,
    getFriendsListByUserID,
    getUnreadMessages,
    postUnreadMessagesToUser,
    resetUnreadMessagesCount,
    getUnreadMessagesTotalCount
}

