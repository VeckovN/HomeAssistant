const {driver} = require('../db/neo4j');
const bcrypt = require('bcrypt');

const findByUsername = async(username)=>{
    const session = driver.session();
    try{
        const userResult = await session.run(
            `MATCH (n:User {username:$name}) 
            RETURN n`,
            {name:username}
        )

        if(userResult.records.length == 0){
            return null
        }
        //OPTINAL MATCH Return Null if cant find node
        const userTypeResult = await session.run(`
            OPTIONAL MATCH (n:User {username:$name})-[r:IS_HOUSEWORKER]->()
            RETURN DISTINCT Case Type(r) WHEN "IS_HOUSEWORKER" THEN "Houseworker" ELSE "Client" END 
        `,
        {name:username})

        const userType = userTypeResult.records[0].get(0);
        const userInfo = userResult.records[0].get(0).properties;
     
        return {props:userInfo, type:userType};
    }
    catch(error){
        console.error("Error finding user info :", error.message); 
        throw new Error("Failed to find user. Please try again later.");
    }
    finally{
        session.close();
    }
}

const checkUser = async(username)=>{
    const session = driver.session();
    try{
        const userResult = await session.run(
            `MATCH (n:User {username:$name}) 
            RETURN n`,
            {name:username}
        )

        if(userResult.records.length == 0){
            return null
        }
        return true;
    }
    catch(error){
        console.error("Error checking user :", error.message); 
        throw new Error("Failed to check user. Please try again later.");
    }
    finally{
        session.close();
    }
}

const checkEmail = async(email)=>{
    const session = driver.session();
    try{
        const userResult = await session.run(
            `MATCH (n:User {email:$email}) 
            RETURN n`,
            {email:email}
        )

        if(userResult.records.length == 0){
            return null
        }

        return true;
    }
    catch(error){
        console.error("Error checking emial :", error.message); 
        throw new Error("Failed to check user email. Please try again later.");
    }
    finally{
        session.close();
    }
}

const changePassword = async(username,password) =>{
    const session = driver.session();
    try{
        const hashedPassword = bcrypt.hashSync(password, 12);
        const result = await session.run(
            `MATCH(n:User {username:$name}) 
            Set n.password = $pass
            return n`,
            {name:username, pass:hashedPassword}
        )

        return result.records[0].get(0).properties;
    }
    catch(error){
        console.error("Error changing the password :", error.message); 
        throw new Error("Failed to change password. Please try again later.");
    }
    finally{
        session.close();
    }
}

const updateCityRelation = async(username,city)=>{
    const session = driver.session();
    try{
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
        
        return result.records[0].get(0);
    }
    catch(error){
        console.error("Error updating user city :", error.message); 
        throw new Error("Failed to update user city. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getAllUsersnameWithPicturePath = async() =>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH (n:User) RETURN n.id, n.picturePath
        `)
        const userInfo = result.records.map(rec=>{
            return {id:rec.get(0), picturePath:rec.get(1)}
        });

        return userInfo;
    }
    catch(error){
        console.error("Error getting users with picture path:", error.message); 
        throw new Error("Failed to get user with picture path. Please try again later.");
    }
    finally{
        session.close();
    }
}
 
// *****INITIAL CREATED
// -Create gender on start of project(becase we don't have aditional gender after in project process)
// CREATE(n:Gender {type:"Male"})
// CREATE(n:Gender {type:"Female"})

//PROFESSIONS
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

module.exports = {findByUsername, changePassword, checkUser, checkEmail, updateCityRelation, getAllUsersnameWithPicturePath};