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

    session.close();
    return true;
}

const checkEmail = async(email)=>{
    const session = driver.session();

    const userResult = await session.run(
        `MATCH (n:User {email:$email}) 
        RETURN n`,
        {email:email}
    )

    if(userResult.records.length == 0){
        return null
    }

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

const updateCityRelation = async(username,city)=>{
    const session = driver.session();
    const result = await session.run(`
        MATCH (n:User {username: $houseworker})-[oldRel:LIVES_IN]->(:City)
        DELETE oldRel
        WITH n
        MERGE (c:City {name: $cityName})
        MERGE (n)-[:LIVES_IN]->(c)
        RETURN n;
    `
    ,{houseworker:username, cityName:city}
    )
    
    session.close();
    return result.records[0].get(0);
}



// *****INITIAL CREATED
// -Create gender on start of project(becase we don't have aditional gender after in project process)
// CREATE(n:Gender {type:"Male"})
// CREATE(n:Gender {type:"Female"})

//PRofessions
//CREATE(a:Profession {title:"Housekeeper", description:"Responsible for cleaning and maintaining the cleanliness of the house"})
//CREATE(a:Profession {title:"Nanny", description:"Provides childcare services, including caring for children, preparing meals, and helping with homework"})
//CREATE(a:Profession {title:"Personal Chef", description:"Prepares meals for the household, including planning menus and accommodating dietary restrictions"})
//CREATE(a:Profession {title:"Gardener", description:"Takes care of the garden, lawn, and outdoor landscaping"})
//CREATE(a:Profession {title:"Personal Driver", description:"Provides transportation services, particularly for families with multiple members"})
//CREATE(a:Profession {title:"Elderly Caregiver", description:"Offers assistance and companionship to elderly family members"})
//CREATE(a:Profession {title:"Pet Sitter", description:"Takes care of pets, including walking dogs, feeding, and grooming"})
//CREATE(a:Profession {title:"Home Health Aide", description:"Provides medical and personal care to individuals with health needs"})
//CREATE(a:Profession {title:"Personal Shopper", description:"Assists with shopping for groceries, clothing, and other household needs"})
//CREATE(a:Profession {title:"Butler", description: "Manages various aspects of the household, such as scheduling, organizing, and supervising other staff"})


//----------------CHAT PART--------------------






module.exports = {findByUsername, changePassword, checkUser, checkEmail, updateCityRelation};