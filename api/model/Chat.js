const {incr, set, hmset, sadd, hmget, exists, zrange, smembers, srandmember, zadd, zrangerev, srem, del, get, rename, scard} = require('../db/redis');
const {formatDate, parseFormattedDate, calculateTimeDifference} = require('../utils/dateUtils');
const { getUserIdByUsername, getUserInfoByUserID, getUserPicturePath, getUnreadMessageCountByRoomID, recordNotification, getUsernameByUserID} = require('../db/redisUtils');

const notificationType = "chatGroup";

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
    if(result == 0){
        return {message:"", dateDiff:null};
    }
    console.log("RESIULL : ", result);
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
// const createRoom = async(firstUsername, secondUsername)=>{
const createRoom = async(clientUsername, houseworkerUsername)=>{

    // const firstUserID = getUserIdByUsername(firstUsername);
    // const secondUserID = getUserIdByUsername(secondUsername);

    const clientID = getUserIdByUsername(clientUsername);
    const houseworkerID = getUserIdByUsername(houseworkerUsername);

    //get iid of users ---- user:1 , user:3  --> roomID is 1:3
    // const usersRoomID = getRoomIdInOrder(firstUserID, secondUserID);
    const usersRoomID = getRoomIdInOrder(clientID, houseworkerID);

    if(usersRoomID === null){
        //users not exists
        return null;
    }
    //create rooms
    //user:{userID}:room room:{minUser}:{maxUser}
    // await sadd(`user:${firstUserID}:rooms`, `${usersRoomID}`)
    // await sadd(`user:${secondUserID}:rooms`, `${usersRoomID}`)
    await sadd(`user:${clientID}:rooms`, `${usersRoomID}`)
    await sadd(`user:${houseworkerID}:rooms`, `${usersRoomID}`)

    //notify only houseworker for ID
    const message = `The client ${clientUsername} has started conversation with you`;
    const notification = await recordNotification(clientID, houseworkerID, notificationType, message);

    //notify new user that added to group chat

    //return created room id and names of users
    return [{
        id:usersRoomID,
        //get names from hashed sets ("username" Field)
        names:[
            await hmget(`user:${clientID}`, "username"),
            await hmget(`user:${houseworkerID}`, "username")
        ],
        notification:notification
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
    var unreadMess = [];
    for(const roomID of rooms){
        const userIDS = roomID.split(":");
        const otherUsers = userIDS.filter(el => el!= userID)
        console.log("ROOOOOOOOMMMMM ID: ", roomID);
        const lastMessage = await getLastMessageFromRoom(roomID);
        const countNumber = await getUnreadMessageCountByRoomID(userID, roomID);
        if(countNumber)
        {
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

        roomsArr.push({roomID, lastMessage, users:roomObjectArray})        
    }

    const roomsObj = {rooms:[...roomsArr], unread:unreadMess}
    console.log("RoomS OBJ L :" , roomsObj);
    return roomsObj;
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

const getHouseworkerFirstRoomID = async(userID) =>{
    const userRoomKey = `user:${userID}:rooms`;
    let firstRoomID = await srandmember(userRoomKey, 1);
    return firstRoomID;
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

const addUserToRoom = async(clientID, newUsername, currentRoomID)=>{
    const newUserID = await getUserIdByUsername(newUsername);
    const clientUsername = await getUsernameByUserID(clientID);

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

    var notification = null;
    let notificationArray = [];
    if(newRoomKeyExists) {
        return {roomID:null, isPrivate:isPrivateChat};
    }
    else{
        if(isPrivateChat) //client and one houseworker
        {
            //add newRoomID in their rooms(set collection)
            for (const id of currentUserIDS) { 
                await sadd(`user:${id}:rooms`, newRoomID);

                //notify houseworker that is in chat
                if(id != clientID){
                    message = `The client ${clientUsername} has been added the houseworker ${newUsername} to the chat`;
                    notification = await recordNotification(clientID, id, notificationType, message);
                    notificationArray.push(notification);
                }
            }

            //add notification for the new added user
            message = `You've been added to the group by ${clientUsername}`;
            notification = await recordNotification(clientID, newUserID, notificationType, message);
            notificationArray.push(notification);

            //create new roomKey and store first initial message
            const messageObj = JSON.stringify({message:"Chat Created", from:'Server', date:dateFormat, roomID:newRoomID})
            await zadd(newRoomKey, timestamps, messageObj);
        }
        else{
            //Reinaming Room:ROOMID - sorted set for storing messages
            await rename(currentRoomKey, newRoomKey);
            await sadd(`user:${newUserID}:rooms`, newRoomID);

            // currentUserIDS.forEach(async(id) =>{  THis doesn't handle async/await properly
            //assignment is likely happening after the loop finishes so use this another for loop approach
            for (const id of currentUserIDS) { 
                await srem(`user:${id}:rooms`, currentRoomID);
                await sadd(`user:${id}:rooms`, newRoomID);

                //record notification for group users
                let message;
                console.log("ID :: " + id + " newUIserID: " + newUserID);
                if(id === newUserID){
                    message = `You've been added to the group by ${clientUsername}`;
                }
                else{
                    message = `The client ${clientUsername} has been added the houseworker ${newUsername} to the chat`;
                }
    
                //don't record notificatio for sender(client);
                if(id != clientID){
                    notification = await recordNotification(clientID, id, notificationType, message);
                    notificationArray.push(notification);
                }
            }

            const messageObj = JSON.stringify({message:`User ${newUsername} has been added to the chat`, from:'Server', date:dateFormat, roomID:newRoomID});
            await zadd(newRoomKey, timestamps, messageObj);
        }
        return {
            newAddedUserID:newUserID,
            roomID:newRoomID, 
            isPrivate:isPrivateChat, 
            newUserPicturePath:userPicturePath,
            notifications: notificationArray
        };
    }
}


const removeUserFromRoomID = async(clientID, roomID, username) =>{
    const userID = await getUserIdByUsername(username);
    const clientUsername = await getUsernameByUserID(clientID);

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
    
    let notificationsArray =[];
    //(FOR REMOVED USER)
    //-find set `user:${userID}:rooms` and remove roomID from that set
    await srem(`user:${userID}:rooms`, roomID);
    const message = `You've been kicked from the group chat by ${clientUsername}`;
    const notification = await recordNotification(clientID, userID, notificationType, message);
    notificationsArray.push(notification);

    //FOR OTHER MEMBERS (replace the old RoomID with new one)
    // newIds.forEach(async(id) =>{ 
    for (const id of newIds) {
        await srem(`user:${id}:rooms`, roomID);
        await sadd(`user:${id}:rooms`, newRoomID);

        if(id !== clientID){
            //notify other users
            const message = `The houseworker ${username} has been kicked from the group by ${clientUsername}`;
            const notification = await recordNotification(clientID, id, notificationType, message);
            notificationsArray.push(notification);   
        }
    // })
    }

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
        kickedUserID:userID,
        notifications:notificationsArray
    };
}

const deleteRoomByRoomID = async(clientID, roomID) =>{
    const usersID = roomID.split(':');
    const clientUsername = await getUsernameByUserID(clientID);

    let notificationsArray =[];
    for (const id of usersID) {
        await srem(`user:${id}:rooms`, roomID); //delte example memeber 1:2 in user:1:rooms 

        if(id != clientID){
            const message = `The room ${roomID} has been deleted by ${clientUsername}`;
            const notification = await recordNotification(clientID, id, notificationType, message);  
            notificationsArray.push(notification);
        }
    }

    //Delete sorted Set which contains all messages in ROOM
    await del(`room:${roomID}`);
    return notificationsArray;

}
 
const sendMessage = async(messageObj) =>{
    const {roomID, from} = messageObj;
    const roomKey = `room:${roomID}`;
    const roomExists = await exists(roomKey);
    const fromUsername = await getUsernameByUserID(from);

    const timestamps = Date.now(); //used for score value (miliseconds)
    const date = new Date(timestamps); //obj that contains 
    const dateFormat = formatDate(date);
    const newMessageObj = {...messageObj, date:dateFormat};

    const usersID = roomID.split(":");//[1,2]
    let lastMessage = null;

    let createRoomNotification = null;
    if(!roomExists){
    //or we have to create room and then send message
    //ROOM WILL BE ONLY CREATED WHEN Client send message TO HOUSEWORKER and this houseworker doesn't have room 
        for(const id of usersID){
            await sadd(`user:${id}:rooms`, roomID);

            if(id !=from){
                console.log("RECORD CLIENT START NOTIFI");
                const message = `The client ${fromUsername} has started conversation with you`
                createRoomNotification = await recordNotification(from, id, notificationType, message);
            }
        }
    }

    if(usersID.length == 2){
        //only for private conversation the last message is displayed
        lastMessage = messageObj.message;
    }

    const unreadMessArray = await postUnreadMessagesToUser(roomID, from);
    await zadd(roomKey, timestamps, JSON.stringify(newMessageObj));
    return {roomKey, dateFormat, lastMessage, unreadMessArray, createRoomNotification};
}

const postUnreadMessagesToUser = async(roomID, senderUserID) =>{
    const userIDFromRoom = roomID.split(":").filter(id => id != senderUserID);
    
    let unreadMessagesArray = [];
    userIDFromRoom.forEach(async(id)=>{
        const unreadMessKey =`user${id}:room:${roomID}:unread`
        let countNumber = await getUnreadMessageCountByRoomID(id, roomID);
        console.log("\n unreaDMESSKEYT: ", unreadMessKey);
        console.log("\n COUNT NUMBER: " , countNumber);
        
        let updateStatus = false;
        //the unreadMessagesExist
        if(countNumber){
            countNumber = countNumber + 1;
            updateStatus = true;
        }
        else{
            countNumber = 1;
        }
        unreadMessagesArray.push({roomID, recipientID:id, countNumber, updateStatus});
        // await hmset(unreadMessKey, ["last_received_timestamp", timestamps, "count", countNumber, "sender", from]);
        await hmset(unreadMessKey, ["count", countNumber, "sender", senderUserID]);
    })

    return unreadMessagesArray;
}

const getUnreadMessages = async(username) =>{
    let userID = await getUserIdByUsername(username);
    const userRoomKey = `user:${userID}:rooms`;
    let rooms = await smembers(userRoomKey);

    var unreadMessageArray = [];
    let totalCount = 0;
    for(const roomID of rooms){
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
    }

    const unreadMessageObj = {unread:unreadMessageArray, totalUnread:totalCount}
    return unreadMessageObj;
}

//when user click on room with unread messages
const resetUnreadMessagesCount = async(roomID, userID) =>{
    try{
        const unreadMessKey = `user${userID}:room:${roomID}:unread`
        const countNumber = await getUnreadMessageCountByRoomID(userID, roomID);
        await del(unreadMessKey);
        return {status:"success", removedCount:countNumber};
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
    getUnreadMessagesTotalCount,
    getHouseworkerFirstRoomID
}

