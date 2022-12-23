const session = require('../db/neo4j');

const findByUsername = async(username)=>{

    //finduser and return userType and userInfo
    const result = await session.run(`
        MATCH (n:User {username:$name})-[r:IS_CLIENT]->()
        RETURN 
        CASE 
            WHEN TYPE(r) = "IS_CLIENT" THEN "Client"
            WHEN TYPE(r) = "IS_HOUSEWORKER" THEN "Houseworker"
        END AS userType, n 
    `,
    {name:username})

    const userType = result.records[0].get(0);
    const userInfo = result.records[0].get(1).properties;
    console.log("ISCLIENT: " + JSON.stringify(userType) + "--- " + JSON.stringify(userInfo));

    return {props:userInfo, type:userType};

}





module.exports = {findByUsername};