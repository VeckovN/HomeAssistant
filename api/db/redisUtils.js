const {hmset, hmget, get, zcard, zadd, zrangerev, incr} = require('../db/redis');
const {formatDate} = require('../utils/dateUtils');

const getUserIdByUsername = async (username)=>{
    const user = await get(`username:${username}`); //user:{userID}
    console.log("USERRRRR : "  + user);
    let userID = user.split(':')[1]; //[user, {userID}]
    return userID
}

const getUsernameByUserID = async (userID)=>{
    //by default hmget returns array , but with [] descruction string will be retunred
    const [username] = await hmget(`user:${userID}`, "username")
    return username;
}

const getUserInfoByUserID = async(userID) =>{
    const userInfo = await hmget(`user:${userID}`, ["username","picturePath"]);
    return {username:userInfo[0], picturePath:userInfo[1]};
}

const getUserPicturePath = async(username) =>{
    const userID = await getUserIdByUsername(username);
    const [picturePath] = await hmget(`user:${userID}`, "picturePath");
    return picturePath;
}

const updateUserPicturePath = async(username, picturePath) =>{
    const userID = await getUserIdByUsername(username);
    const userKey= `user:${userID}`
    await hmset(userKey, ['picturePath', picturePath]);
}

const getUnreadMessageCountByRoomID = async(userID, roomID) =>{
    const unreadObjKey =`user${userID}:room:${roomID}:unread`
    const unreadCount = await hmget(unreadObjKey, "count");
    const countNumber = Number(unreadCount);

    return countNumber;
}


const recordNotification = async(fromID, toID, type, message) =>{
    const timestamps = Date.now(); //used for score value (miliseconds)
    const dateFormat = formatDate(new Date(timestamps));

    const notificationID = await incr(`notificationCount`);

    const notification = { 
        id:notificationID,
        from:fromID, //client ID, notification from who
        to:toID,
        type:type, //comment, rate, chatGroup
        date:dateFormat,
        message:message,
        read:false
    }
    await zadd(`user:${toID}:notifications`, timestamps, JSON.stringify(notification));

    return notification;
}

const getNotificationsByOffset = async(userID, offset, endIndex) =>{
    const notifications = await zrangerev(`user:${userID}:notifications`, offset, endIndex);
    const notificationsObj = notifications.map((mes) => JSON.parse(mes)); //Parsing JSON to obj
    return notificationsObj;
}

const getNotificationsUnreadCount = async(userID) =>{
    const notifications = await zrangerev(`user:${userID}:notifications`, 0, -1);
    const notificationsObj = notifications.map((mes) => JSON.parse(mes)); //Parsing JSON to obj
    const unreadNotificationCount = notificationsObj.reduce((count, notification) =>{
        return count + (notification.read === false ? 1 : 0);
    },0);
    
    return unreadNotificationCount;
}

const getNotificationsUnreadTotalCount = async(userID)=>{
    const notificationCount = await zcard(`user:${userID}:notifications`);
    return notificationCount;
}

module.exports = {
    getUserIdByUsername, 
    getUsernameByUserID,
    getUserInfoByUserID,
    getUserPicturePath,
    updateUserPicturePath,
    getUnreadMessageCountByRoomID,
    recordNotification,
    getNotificationsUnreadCount,
    getNotificationsByOffset,
    getNotificationsUnreadTotalCount
}