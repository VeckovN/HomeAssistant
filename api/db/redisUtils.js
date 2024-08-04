const {incr, set, hmset, sadd, hmget, exists, zrange, smembers, zadd, zrangerev, srem, del, get, rename, scard} = require('../db/redis');
const formatDate = require('../utils/dateUtils');

const UserIdByUsername = async (username)=>{
    const user = await get(`username:${username}`); //user:{userID}
    console.log("USERRRRR : "  + user);
    let userID = user.split(':')[1]; //[user, {userID}]
    return userID
}

const getUserIdByUsername = async (username)=>{
    const user = await get(`username:${username}`); //user:{userID}
    console.log("USERRRRR : "  + user);
    let userID = user.split(':')[1]; //[user, {userID}]
    return userID
}

///////////////////////////////////////////

const usernameByUserID = async (userID)=>{
// const getUsernameByUserID = async (userID)=>{
    //by default hmget returns array , but with [] descruction string will be retunred
    const [username] = await hmget(`user:${userID}`, "username")
    return username;
}

const getUsernameByUserID = async (userID)=>{
    //by default hmget returns array , but with [] descruction string will be retunred
    const [username] = await hmget(`user:${userID}`, "username")
    return username;
}

///////////////////////////////////////////////////

const userInfoByUserID = async(userID) =>{
    const userInfo = await hmget(`user:${userID}`, ["username","picturePath"]);
    console.log("USERRRRR INFGOOOOOOOOOO" , userInfo);
    return {username:userInfo[0], picturePath:userInfo[1]};
}

const getUserInfoByUserID = async(userID) =>{
    const userInfo = await hmget(`user:${userID}`, ["username","picturePath"]);
    console.log("USERRRRR INFGOOOOOOOOOO" , userInfo);
    return {username:userInfo[0], picturePath:userInfo[1]};
}

const getUserPicturePath = async(username) =>{
    const userID = await UserIdByUsername(username);
    const [picturePath] = await hmget(`user:${userID}`, "picturePath");
    return picturePath;
}


module.exports = {
    getUserIdByUsername, 
    getUsernameByUserID,
    getUserInfoByUserID,
    getUserPicturePath
}