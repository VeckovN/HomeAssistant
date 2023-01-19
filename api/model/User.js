const {session,driver} = require('../db/neo4j');
const bcrypt = require('bcrypt');

//return user Type and user Info
const findByUsername = async(username)=>{
    //finduser and return userType and userInfo
    const session = driver.session();

    const userResult = await session.run(
        `MATCH (n:User {username:$name}) 
        RETURN n`,
        {name:username}
    )

    if(userResult.records.length == 0){
        return null
    }
    //Return userType
    //OPTINAL MATCH Return Null if cant find node(in this situatian that is relation-IS_HOUSEWORKER)
    const userTypeResult = await session.run(`
        OPTIONAL MATCH (n:User {username:$name})-[r:IS_HOUSEWORKER]->()
        RETURN DISTINCT Case Type(r) WHEN "IS_HOUSEWORKER" THEN "Houseworker" ELSE "Client" END 
    `,
    {name:username})


    const userType = userTypeResult.records[0].get(0);
    const userInfo = userResult.records[0].get(0).properties;
    console.log("User: " + JSON.stringify(userType) + "--- " + JSON.stringify(userInfo));

    session.close();
    return {props:userInfo, type:userType};
}

const checkUser = async(username)=>{
    //finduser and return userType and userInfo
    const session = driver.session();

    const userResult = await session.run(
        `MATCH (n:User {username:$name}) 
        RETURN n`,
        {name:username}
    )

    if(userResult.records.length == 0){
        return null
    }
    //Return userType

    session.close();
    return true;
}


const changePassword = async(username,password) =>{
    const session = driver.session();

    console.log("Passwrod: " + password);
    const hashedPassword = bcrypt.hashSync(password, 12);

    console.log("Hashed password: " + hashedPassword);

    const result = await session.run(
        `MATCH(n:User {username:$name}) 
        Set n.password = $pass
        return n`,
        {name:username, pass:hashedPassword}
    )

    session.close();

    return result.records[0].get(0).properties;
}




//----------------CHAT PART--------------------






module.exports = {findByUsername, changePassword, checkUser};