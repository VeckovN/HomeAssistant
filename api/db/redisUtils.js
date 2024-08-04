const {hmset, hmget, get} = require('../db/redis');

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
    console.log("USERRRRR INFGOOOOOOOOOO" , userInfo);
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

module.exports = {
    getUserIdByUsername, 
    getUsernameByUserID,
    getUserInfoByUserID,
    getUserPicturePath,
    updateUserPicturePath
}