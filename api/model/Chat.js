const {incr, set, hmset, hmget, exists, zrange, smembers, srandmember, zadd, zaddxx, zrangerev, del, rename, zcard, zrem, zrangerevscores} = require('../db/redis');
const {formatDate, calculateTimeDifference} = require('../utils/dateUtils');
const { getUserIdByUsername, getUserInfoByUserID, getUserPicturePath, getUnreadMessageCountByRoomID, recordNotification, getUsernameByUserID} = require('../db/redisUtils');

const notificationType = "chatGroup";

//With username(same username as in Neo4j) we got userID(same user but in redis)
//with userKey(user:{userID}) we can access to userINFO in Redis DB ()
const createUser = async(username, hashedPassword, picturePath) =>{
    try{
        const usernameKey = `username:${username}`;
        const freeID = await incr("total_users"); //total_users is data in Redis(number of users)
        const userKey = `user:${freeID}`;
    
        await set(usernameKey, userKey)
        await hmset(userKey, ["username", username, "password", hashedPassword, "picturePath", picturePath]);
        
        return {success:true, id:freeID, username};
    }
    catch(err){
        console.error("Redis Create user Errror: " + err);
        return {success:false, message:"Error with Creating Redis User"}
    }
}

const deleteUserOnNeo4JFailure = async(username, userID) =>{
    try{
        const usernameKey = `username:${username}`;
        await del(usernameKey); 
        const userKey = `user:${userID}`;
        await del(userKey); 
        return {success:true, message:"User's set and hmset successfully deleted"}
    }
    catch(error){
        console.error("Redis deleting user Failed");
        return {success:false}
    }
}

const getLastMessageFromRoom = async(roomID) =>{
    try{
        const result = await zrange(`room:${roomID}`, -1, -1);
        if(result == 0){
            return {message:"", dateDiff:null};
        }
        const parsedObj = JSON.parse(result);
        const currentDate = parsedObj.date;
        const difference = calculateTimeDifference(currentDate);
        const lastMessage  = {message:parsedObj.message, dateDiff:difference}

        return lastMessage;
    }
    catch(error){
        console.error("Error fetching last message from the room:", error.message); 
        throw new Error("Failed to get last room message. Please try again later."); 
    }
}

// Format room ID to start with the lower user ID value
const getRoomIdInOrder = (firstUserID, secondUserID) =>{
    const minUserID = firstUserID > secondUserID ? secondUserID : firstUserID;
    const maxUserID = firstUserID > secondUserID ? firstUserID : secondUserID;
    return `${minUserID}:${maxUserID}`
}

const createRoom = async(clientUsername, houseworkerUsername)=>{
    try{
        const clientID = getUserIdByUsername(clientUsername);
        const houseworkerID = getUserIdByUsername(houseworkerUsername);
        const usersRoomID = getRoomIdInOrder(clientID, houseworkerID);

        if(usersRoomID === null){
            return null;
        }

        const timestamps = Date.now(); //used for score value (miliseconds)
        await zadd(`user:${clientID}:rooms`, timestamps, `${usersRoomID}`);
        await zadd(`user:${houseworkerID}:rooms`, timestamps, `${usersRoomID}`);
        
        //notify only houseworker for ID
        const message = `The client ${clientUsername} has started conversation with you`;
        const notification = await recordNotification(clientID, houseworkerID, notificationType, message);

        //return created room id and names of users
        return [{
            id:usersRoomID,
            names:[
                await hmget(`user:${clientID}`, "username"),
                await hmget(`user:${houseworkerID}`, "username")
            ],
            notification:notification
        }]
    }
    catch(error){
        console.error("Error creating the room:", error.message); 
        throw new Error("Failed to create the room. Please try again later."); 
    }
}

const getMessages = async(roomID, offset, size) =>{
    try{
        const roomKey = `room:${roomID}`;
        const roomExists = await exists(roomKey)
        if(!roomExists)
            return null;

        const messages = await zrangerev(roomKey, offset, size -1);
        const messagesObj = messages.map((mes) => JSON.parse(mes));
        return messagesObj;
    }
    catch(err){
        console.error(err);
        throw new Error("Failed to fetch messages. Please try again later.");
    }
}

const getMoreMessages = async(roomID, pageNumber) =>{
    try{
        const size = 10;
        const offset = size * pageNumber;
        const endIndex = offset + size -1; 
     
        const roomKey = `room:${roomID}`;
        const roomExists = await exists(roomKey)
        if(!roomExists)
            return null;
    
        const messages = await zrangerev(roomKey, offset, endIndex);
        const messagesObj = messages.map((mes) => JSON.parse(mes)); 
        return messagesObj;
    }
    catch(error){
        console.error("Error fetching messages:", error.message); // Log error for debugging
        throw new Error("Failed to fetch more messages. Please try again later."); // Throw custom error for the caller
    }
}

const getAllRooms = async(username)=>{
    try{
        let userID = await getUserIdByUsername(username);
        const userRoomKey = `user:${userID}:rooms`;
        let rooms = await zrangerev(userRoomKey, 0, -1);
        
        //Get online users and create set for efficient lookups(could be massive)
        const onlineUsers = await smembers(`onlineUsers`);
        const onlineUsersSet = new Set(onlineUsers);

        var roomsArr = []
        var unreadMess = [];
        for(const roomID of rooms){
            const userIDS = roomID.split(":");
            const otherUsers = userIDS.filter(el => el!= userID)
            const lastMessage = await getLastMessageFromRoom(roomID);
            const countNumber = await getUnreadMessageCountByRoomID(userID, roomID);
            if(countNumber)
            {
                const obj ={
                    roomID:roomID,
                    count:countNumber,
                }
                unreadMess.push(obj);
            }
            
            let roomObjectArray =[];
            //for loop instead of foreach *async/await
            for(const id of otherUsers){ 
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
        return roomsObj;
    }
    catch(error){
        console.error("Error fetching rooms:", error.message); 
        throw new Error("Failed to fetch rooms. Please try again later."); 
    }
}

const getOnlineUsersFromChat = async(userID) =>{
    try{
        //set to manage unique users IDs(automatically)
        const usersFromRoomSet = new Set();

        const usersRoomKey = `user:${userID}:rooms`;
        const usersRoomsIDS = await zrangerev(usersRoomKey , 0, -1);

        usersRoomsIDS.forEach(id => {
            const membersIds = id.split(':');
            membersIds.forEach(memberID => {
                usersFromRoomSet.add(memberID);
            })
        })

        const uniqueUserIds = Array.from(usersFromRoomSet);

        const onlineUsers = await smembers(`onlineUsers`);
        const onlineUsersSet = new Set(onlineUsers); // O(1) average time complexity
        const onlineRoomUsers = Array.from(usersFromRoomSet).filter(user => onlineUsersSet.has(user))
        
        return onlineRoomUsers
    }
    catch(error){
        console.error("Error fetching online users from the chat:", error.message); 
        throw new Error("Failed to fetch online chat users. Please try again later.");
    }
}

const getHouseworkerFirstRoomID = async(userID) =>{
    try{
        const userRoomKey = `user:${userID}:rooms`;
        //get first room with highest score 
        const result = await zrangerevscores(userRoomKey, 0, 0);
        console.log("result: ", result);
        return result[0]; 
    }
    catch(error){
        console.error("Error fetching houseworker first room id:", error.message); 
        throw new Error("Failed to fetch houseworker first room id. Please try again later.");
    }
}

const getFriendsListByUserID = async(userID) =>{
    try{
        const usersFromRoomSet = new Set();
        const usersRoomKey = `user:${userID}:rooms`;
        const usersRoomsIDS = await zrangerev(usersRoomKey , 0, -1);

        usersRoomsIDS.forEach(id => {
            const membersIds = id.split(':');
            membersIds.forEach(memberID => {
                usersFromRoomSet.add(memberID);
            })
        })

        //const uniqueUserIds = Array.from(usersFromRoomSet);
        const friendsList = Array.from(usersFromRoomSet);
        return friendsList;
    }
    catch(error){
        console.error("Error fetching friends list:", error.message); 
        throw new Error("Failed to fetch firends list. Please try again later.");
    }
}

const addUserToRoom = async(clientID, newUsername, currentRoomID)=>{
    try{
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
        const date = new Date(timestamps); 
        const dateFormat = formatDate(date);

        const newRoomKeyExists = await exists(newRoomKey);
       
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
                    try{
                        await zadd(`user:${id}:rooms`, timestamps, newRoomID);

                        if(id != clientID){
                            message = `The client ${clientUsername} has added the houseworker ${newUsername} to the chat`;
                            notification = await recordNotification(clientID, id, notificationType, message);
                            notificationArray.push(notification);
                        }
                    }
                    catch(err){
                        console.error("error: ", err);
                    }
                }

                //add notification for the new added user
                message = `You've been added to the group by ${clientUsername}`;
                notification = await recordNotification(clientID, newUserID, notificationType, message);
                notificationArray.push(notification);

                //create new roomKey first initial message
                const messageObj = JSON.stringify({message:"Chat Created", from:'Server', date:dateFormat, roomID:newRoomID})
                await zadd(newRoomKey, timestamps, messageObj);
            }
            else{
                await rename(currentRoomKey, newRoomKey);
                await zadd(`user:${newUserID}:rooms`, timestamps, newRoomID);

                // currentUserIDS.forEach(async(id) =>{  THis doesn't handle async/await properly
                //assignment is likely happening after the loop finishes so use this another for loop approach
                for (const id of currentUserIDS) { 
                    await zrem(`user:${id}:rooms`, currentRoomID);
                    await zadd(`user:${id}:rooms`, timestamps, newRoomID);

                    //record notification for group users
                    let message;
                    if(id === newUserID){
                        message = `You've been added to the group by ${clientUsername}`;
                    }
                    else{
                        message = `The client ${clientUsername} has added the houseworker ${newUsername} to the chat`;
                    }
        
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
    catch(error){
        console.error("Error adding user to room messages:", error.message); 
        throw new Error("Failed to add user to the room. Please try again later.");
    }
}

const removeUserFromRoomID = async(clientID, roomID, username) =>{
    try{
        const userID = await getUserIdByUsername(username);
        const clientUsername = await getUsernameByUserID(clientID);

        const currentRoomKey = `room:${roomID}`
        const currentUserIDS = roomID.split(':');

        const newIds = currentUserIDS.filter(id => id !== userID);
        const newRoomID = newIds.join(":");
        const newRoomKey = `room:${newRoomID}`

        const timestamps = Date.now();
        const date = new Date(timestamps); 
        const dateFormat = formatDate(date);

        //if newRoomKey exist (group with same members)
        //make newRoomKey unique to avoid a conflict with the same roomID
        const newRoomKeyExists = await exists(newRoomKey);
        if(newRoomKeyExists){
            return{
                newRoomID:null, 
                kickedUserID:userID
            }
        }
        
        let notificationsArray =[];
        //for removed user
        await zrem(`user:${userID}:rooms`, roomID);
        const message = `You've been kicked from the group chat by ${clientUsername}`;
        const notification = await recordNotification(clientID, userID, notificationType, message);
        notificationsArray.push(notification);

        //FOR OTHER MEMBERS (replace the old RoomID with new one)
        for (const id of newIds) {
            await zrem(`user:${id}:rooms`, roomID);
            await zadd(`user:${id}:rooms`, timestamps, newRoomID);
            
            if(id !== clientID){
                //notify other users
                const message = `The houseworker ${username} has been kicked from the group by ${clientUsername}`;
                const notification = await recordNotification(clientID, id, notificationType, message);
                notificationsArray.push(notification);   
            }
        }

        //find sorted set and remove user from it (id) room:3:6:22:123 where messages are stored
        await rename(currentRoomKey, newRoomKey);

        const messageObj = JSON.stringify({message:`User ${username} has been kicked from the chat`, from:'Server', date:dateFormat, roomID:newRoomID})
        await zadd(newRoomKey, timestamps, messageObj);

        return {
            newRoomID, 
            kickedUserID:userID,
            notifications:notificationsArray
        };
    }
    catch(error){
        console.error("Error removing user from the room:", error.message); 
        throw new Error("Failed to remove user form the room. Please try again later."); 
    }
}

const deleteRoomByRoomID = async(clientID, roomID) =>{
    try{
        const usersID = roomID.split(':');
        const clientUsername = await getUsernameByUserID(clientID);

        let notificationsArray =[];
        for (const id of usersID) { 
            await zrem(`user:${id}:rooms`, roomID);

            if(id != clientID){
                const message = `The room ${roomID} has been deleted by ${clientUsername}`;
                const notification = await recordNotification(clientID, id, notificationType, message);  
                notificationsArray.push(notification);
            }
        }

        await del(`room:${roomID}`);
        return notificationsArray;
    }
    catch(error){
        console.error("Error fetching messages:", error.message); 
        throw new Error("Failed to delete room. Please try again later."); 
    }
}
 
const sendMessage = async(messageObj) =>{
    try{
        const {roomID, from} = messageObj;
        const roomKey = `room:${roomID}`;
        const roomExists = await exists(roomKey);
        const fromUsername = await getUsernameByUserID(from);

        const timestamps = Date.now();
        const date = new Date(timestamps); 
        const dateFormat = formatDate(date);
        const newMessageObj = {...messageObj, date:dateFormat};

        const usersID = roomID.split(":");
        let lastMessage = null;

        let createRoomNotification = null;
        if(!roomExists){
        //or we have to create room and then send message
        //ROOM WILL BE ONLY CREATED WHEN Client send message TO HOUSEWORKER and this houseworker doesn't have the room 
            for(const id of usersID){
                await zadd(`user:${id}:rooms`, timestamps, roomID);
                if(id !=from){
                    const message = `The client ${fromUsername} has started conversation with you`
                    createRoomNotification = await recordNotification(from, id, notificationType, message);
                }
            }
        }
        else{
            //update all receiver and client room score on message receiving
            for(const id of usersID)
                await zaddxx(`user:${id}:rooms`, timestamps, roomID);
        }

        if(usersID.length == 2){ //private conversation *display last message
            lastMessage = messageObj.message;
        }

        const unreadMessArray = await postUnreadMessagesToUser(roomID, from);
        await zadd(roomKey, timestamps, JSON.stringify(newMessageObj));

        return {roomKey, dateFormat, lastMessage, unreadMessArray, createRoomNotification};
    }
    catch(error){
        console.error("Error sending messages:", error.message);
        throw new Error("Failed to send message. Please try again later.");
    }
}

const postUnreadMessagesToUser = async(roomID, senderUserID) =>{
    try{
        const userIDFromRoom = roomID.split(":").filter(id => id != senderUserID);
        let unreadMessagesArray = [];

        userIDFromRoom.forEach(async(id)=>{
            const unreadMessKey =`user${id}:room:${roomID}:unread`
            let countNumber = await getUnreadMessageCountByRoomID(id, roomID);
            let updateStatus = false;

            if(countNumber){
                countNumber = countNumber + 1;
                updateStatus = true;
            }
            else{
                countNumber = 1;
            }
            
            unreadMessagesArray.push({roomID, recipientID:id, countNumber, updateStatus});
            await hmset(unreadMessKey, ["count", countNumber, "sender", senderUserID]);
        })

        return unreadMessagesArray;
    }
    catch(error){
        console.error("Error posting  unread messages to user:", error.message); 
        throw new Error("Failed to post unread messages. Please try again later.");
    }
}

const getUnreadMessages = async(username) =>{
    try{
        let userID = await getUserIdByUsername(username);
        const userRoomKey = `user:${userID}:rooms`;
        let rooms = await zrangerev(userRoomKey , 0, -1);

        var unreadMessageArray = [];
        let totalCount = 0;
        for(const roomID of rooms){
            const countNumber = await getUnreadMessageCountByRoomID(userID, roomID);
            if(countNumber)
            {
                const obj ={
                    roomID:roomID,
                    count:countNumber,
                }
                unreadMessageArray.push(obj);
                totalCount += countNumber;
            }
        }
        const unreadMessageObj = {unread:unreadMessageArray, totalUnread:totalCount}
        return unreadMessageObj;
    }
    catch(error){
        console.error("Error fetching unread messages:", error.message); 
        throw new Error("Failed to fetch unread messages. Please try again later.");
    }
}

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
        let rooms = await zrangerev(userRoomKey , 0, -1);
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
    try{
        const userKey = `user:${userID}:rooms`;
        const count = await zcard(userKey);
        return count;
    }
    catch(error){
        console.error("Error getting room count:", error.message); 
        throw new Error("Failed to get room count. Please try again later.");
    }
}

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

