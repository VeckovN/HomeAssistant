const {driver} = require('../db/neo4j');
const { set, get, expire } = require('../db/redis');
const {recordNotification, getUserIdByUsername, updateUserPicturePath, getUserPicturePublicId} = require('../db/redisUtils');
const {updateToCloudinaryBuffer} = require('../utils/cloudinaryConfig');

const notificationType="comment";

const findByUsername = async (username)=>{
    const session = driver.session();
    try{
        const result = await session.run(
            `MATCH (n:User {username:$name})-[:IS_CLIENT]->() 
            RETURN n`,
            {name:username})

        //if user not exists 
        if(result.records.length == 0)
            return null
        else{
            const singleRecord = result.records[0];
            //whole OBject(node) (with all properies)
            const node = singleRecord.get(0);
            //to get all properties 
            const client = node.properties;
            return client;
        }
    }
    catch(error){
        console.error("Error finding username :", error.message); 
        throw new Error("Failed to find user by username. Please try again later.");
    }
    finally{//close session regardless of the outcome
        session.close();
    }
}

const getCity = async(username)=>{
    const session = driver.session();
    try{
        const result = await session.run(
            `MATCH(n:User)-[:LIVES_IN]-(c)
            WHERE n.username = $username
            RETURN c.name `,
            {username:username}
        )

        const city = result.records[0].get(0);
        return city;
    }
    catch(error){
        console.error("Error finding username :", error.message); 
        throw new Error("Failed to fetch all users. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getInfo = async (username) =>{
    const session = driver.session();
    try{
        const result = await session.run(
            `MATCH(n:User {username:$name})-[:IS_CLIENT]->(c)
                MATCH(n)-[:GENDER]->(g)
                MATCH(n)-[:LIVES_IN]->(l)
                RETURN n,  g.type, l.name`
            ,{name:username}
        )

        if(result.records.length == 0)
            return [];   

        const clientProp = result.records[0].get(0).properties;
        const clientGender = result.records[0].get(1);
        const clientCity = result.records[0].get(2);

        const { password, ...clientInfo} = clientProp 

        clientInfo.gender = clientGender;
        clientInfo.city = clientCity;

        return clientInfo;
    }
    catch(error){
        console.error("Error getting info :", error.message); 
        throw new Error("Failed to get info. Please try again later.");
    }
    finally{
        session.close();
    }
}

const findAll = async ()=>{
    const session = driver.session();
    //more than one is expected
    try{
        const result = await session.run(
            'Match(n:User)-[:IS_CLIENT]->() return n'
        )

        if(result.records.length == 0)
            return []

        const clients = result.records.map(el=>{
            return el.get(0).properties;
        })
        return clients;
    }
    catch(error){
        console.error("Error finding username :", error.message); 
        throw new Error("Failed to fetch all users. Please try again later.");
    }
    finally{
        session.close();
    }
}

const findByUsernameAndDelete = async (username)=>{
    const session = driver.session();
    try{
        await session.run(
            "MATCH (n:User {username:$name})-[r:IS_CLIENT]->(m) DELETE r, n, m",
            {name:username}
        )
    }
    catch(error){
        console.error("Error deleting user :", error.message); 
        throw new Error("Failed to delete user. Please try again later.");
    }
    finally{
        session.close();
    }
    return await findAll();
}

const getRandomUsernames = async(count) =>{
    const session = driver.session();
    // const countInt = parseInt(count, 10);
    try{
        const clientsResult = await session.run(`
            MATCH (n:User)-[:IS_CLIENT]->(:Client) 
            RETURN n.username AS username 
            ORDER BY rand() 
            LIMIT toInteger($count)
        `, {count:count});

        const clients = clientsResult.records.map(record => record.get('username'));
        return clients;

    }catch(error){
        console.error("Error getting random client's username :", error.message); 
        throw new Error("Failed to get random username's. Please try again later.");
    }
}

const getRandomUsernamesAndID = async(count) =>{
    const session = driver.session();
    try{
        const clientsResult = await session.run(`
            MATCH (n:User)-[:IS_CLIENT]->(:Client) 
            RETURN n.id AS id, n.username AS username
            ORDER BY rand() 
            LIMIT toInteger($count)
        `, {count:count});

        const clients = clientsResult.records.map(record => ({
            id: record.get('id'), //get(0) the first returned value
            username: record.get('username') //get(0) the first returned value
        }));

        return clients;

    }catch(error){
        console.error("Error getting random client's username :", error.message); 
        throw new Error("Failed to get random username's. Please try again later.");
    }
}

const getAllComments = async (username)=>{
    const session = driver.session();
    try{
        const result = await session.run(`
        MATCH(n:Client {username:$name})-[r:COMMENTED]->(m)MATCH(m)-[b:BELONGS_TO]->(c) 
        RETURN m.context,c.username`,
        {name:username})

        const comments = result.records.map(rec=>{
            //rec.get(0) is first node -> Comment node --- rec.get(0).properties -> (context='example comentar')
            //rec.get(1) is seccodn node -> Houseworker node --- rec.get(1).properties ->(username="Sara", working_hours='200')
            return {comment:rec.get(0), houseworker:rec.get(1)}
        });

        return comments;
    }
    catch(error){
        console.error("Error getting all comments :", error.message); 
        throw new Error("Failed to fetch all user comments. Please try again later.");
    }
    finally{
        session.close();
    }
}

const commentHouseworker = async(client, houseworker, comment)=>{
    const session = driver.session();
    try{
        const result = await session.run(`
        MATCH (n:Client {username:$client})
        MATCH (m:HouseWorker {username:$houseworker})
        CREATE (c:Comment {context:$comment, read:false, timestamp: timestamp()} )
        CREATE (n)-[:COMMENTED]->(c)
        CREATE (c)-[:BELONGS_TO]->(m)
        RETURN ID(c) AS commentID, apoc.date.format(c.timestamp, "ms", "dd.MM.yyyy") AS commentTimestamp`
        , {client:client, houseworker:houseworker, comment:comment}
        )

        const clientID = await getUserIdByUsername(client);
        const houseworkerID = await getUserIdByUsername(houseworker);

        const message = `You've got comment from ${client}`;
        const notification = await recordNotification(clientID, houseworkerID, notificationType, message);

        const commentID = parseInt(result.records[0].get(0));
        const commentDate = result.records[0].get(1);
        
        return {commentID, read:false, commentDate, notificationObj:notification};
    }
    catch(error){
        console.error("Error posting comment :", error.message); 
        throw new Error("Failed to post the comment. Please try again later.");
    }
    finally{
        session.close();
    }
}


const deleteComment = async(username, commentID)=>{
    const session = driver.session();
    try{
        const comment_id = parseInt(commentID);
        const result = await session.run(`
        MATCH(n:Client {username:$client})
        MATCH (c:Comment) WHERE ID(c) = $id
        MATCH(n)-[r:COMMENTED]->(c)
        MATCH(c)-[t:BELONGS_TO]->(m)
        DELETE r,t,c
        RETURN n`
        , {client:username, id:comment_id}
        )

        //get username of deleted User comment -> (Belongs to 'm' than his/her username)
        // const houseworker = 
        // const message = `The user ${username} has deleted the comment`;
        // const notificationID = await recordNotificationbyUsername(houseworker, notificationType, message);

        return result.records[0];
    }
    catch(error){
        console.error("Error deleting comment :", error.message); 
        throw new Error("Failed to delete user comment. Please try again later.");
    }
    finally{
        session.close();   
    }
}

const rateHouseworker = async(clientID, clientUsername, houseworkerUsername, rating)=>{
    const session = driver.session();
    //MARGE - ON MATCH SET - when Relationship exist we wanna set new rating value not to create another relationsip
    try{

        const result = await session.run(`
            MATCH(n:Client {username:$client})
            MATCH(m:HouseWorker {username:$houseworker})
            MERGE (n)-[r:RATED]->(m)
            ON CREATE SET r.rating = $rating
            ON MATCH  SET r.rating = $rating
            RETURN r.rating
        `,{client:clientUsername, houseworker:houseworkerUsername, rating:rating}
        );
        
        const rateValue = result.records[0].get(0);

        const houseworkerID = await getUserIdByUsername(houseworkerUsername);
        const message = `The user ${clientUsername} has rated you with ${rateValue} `;
        const notification = await recordNotification(clientID, houseworkerID, notificationType, message);

        return {notification:notification};
    }
    catch(error){
        console.error("Error rating user :", error.message); 
        throw new Error("Failed to rate user. Please try again later.");
    }
    finally{
        session.close();
    }
}

const addInterest = async(username, interest) =>{
    const session = driver.session();

    try{
        await session.run(` 
            MATCH(n:User {username:$client})-[:IS_CLIENT]->(m)
            MATCH(p:Profession {title:$profession})
            MERGE(m)-[r:INTEREST]->(p)
            RETURN p.title`,
        {client:username, profession:interest})

    }
    catch(error){
        console.error("Error adding user interest :", error.message); 
        throw new Error("Failed to add user interest. Please try again later.");
    }
    finally{
        session.close()
    }
}

const create = async(clientObject)=>{
    const session = driver.session();
    const {id, username, email, password, firstName, lastName, picturePath, picturePublicId, city, gender, interests} = clientObject;

    try {
        //WITH Clause is necessary between Create and Other part of query(Create Gender and City)
        const result = await session.run(`
        CREATE (n:User 
            {
                id: toInteger($id),
                username:$username, 
                email:$email, 
                password:$password, 
                first_name:$firstName,
                last_name:$lastName,
                picturePath:$picturePath,
                picturePublicId:$picturePublicId
            }
            ) 
            -[:IS_CLIENT]->
            (
            m:Client
            {
                username:$username  
            })
        WITH n as user , m as client
        MATCH(g:Gender {type:$gender})
        CREATE(user)-[r:GENDER]->(g)

        MERGE(c:City {name:$city})
        MERGE(user)-[h:LIVES_IN]->(c)
        RETURN user,g.type,c.name
        `
        ,{id:id, username:username, email:email, password:password, firstName:firstName, lastName:lastName, picturePath:picturePath, picturePublicId:picturePublicId, city:city, gender:gender, interests:interests}
        )

        //Interests relation between profession and Client
        const interestsArray = interests.split(',');
        //add professions
        interestsArray.forEach(interest => {
            addInterest(username, interest);
        });

        const user = result.records[0].get(0).properties;
        const userGender = result.records[0].get(1);
        const userCity = result.records[0].get(2);
        return {
            user, gender:userGender, city:userCity
        }
    }
    catch(error){
        console.error("Error creating user :", error.message); 
        throw new Error("Failed to create user. Please try again later.");
    }
    finally{
        session.close();
    }
}

const update = async(username, newValue)=>{
    const session = driver.session();
    try{
        let {file, ...newUserData} = newValue;

        if(file){
            try{
                const cuurentPicturePublicID = await getUserPicturePublicId(username);
                const uploadResult = await updateToCloudinaryBuffer(file.data, cuurentPicturePublicID)
                const newPicturePath = uploadResult.secure_url; 
                await updateUserPicturePath(username, newPicturePath); //update Redis DB
                newUserData.picturePath = newPicturePath; //update neo4j DB as well
            }
            catch(error){
                console.error("Failed to upload image: ", error);
                throw new Error;
            }
        }

        const result = await session.run(`
            MATCH (n:User { username: $client})
            SET n += $object
            RETURN n
        `,{client:username, object:newUserData}
        )

        return result.records[0].get(0).properties;
    }
    catch(error){
        console.error("Error updating user :", error.message); 
        throw new Error("Failed to update user. Please try again later.");
    }
    finally{
        session.close();
    }
}

const updateCity = async(username, city)=>{
    const session = driver.session();

    try{
        const result = await session.run(`
            MATCH(n:User{username:$client})
            MATCH(n)-[:LIVES_IN]->(c:City)
            Set c.name = $cityName
            return c.name
        `
        ,{client:username, cityName:city}
        )

        return result.records[0].get(0);
    }
    catch(error){
        console.error("Error updating user's city :", error.message); 
        throw new Error("Failed to update user's city. Please try again later.");
    }
    finally{
        session.close();
    }
}

const updateGender = async(gender)=>{
    const session = driver.session();
    try{
        const ourUsername = "Sara";
        const result = await session.run(`
            MATCH(n:User{username:$client})
            MATCH(n)-[:GENDER]->(g:Gender)
            Set g.type = $gender
            return g.type
        `
        ,{client:ourUsername, gender:gender}
        )

        return result.records[0].get(0);
    }
    catch(error){
        console.error("Error updating user's gender :", error.message); 
        throw new Error("Failed to update user's gender. Please try again later.");
    }
    finally{
        session.close();
    }
}


//----------RECOMMENDATIONS

const interestedProfessions = async(professions)=>{
    // MATCH(n:User)-[:IS_HOUSEWORKER]->(h)-[:OFFERS]-(p:Profession {title:"Kuvar"}) return h, count(h) as add
    // ORDER BY add desc
    // LIMIT 5
}
 
const checkRecommendedInCache = async(username) =>{
    try{
        const data = await get("recommended:" + username);
        if(data){
            const dataObj = JSON.parse(data);
            return dataObj
        }
        else
            return null
    }
    catch(error){
        console.error("Error checking recommended Cache :", error.message); 
        throw new Error("Failed to check recommended Cache. Please try again later.");
    }
}

const recomendedByCityAndInterest = async(username,city) =>{
    const session = driver.session();
    try{
        const catchedData = await checkRecommendedInCache(username);

        if(catchedData == null) {
            const result = await session.run(`
                MATCH(h:HouseWorker)-[:OFFERS]->(o:Profession)
                MATCH(uu:User)-[:IS_CLIENT]->(c:Client)-[:INTEREST]->(o)
                MATCH(h)<-[:IS_HOUSEWORKER]-(u:User)-[:LIVES_IN]->(l:City)
                MATCH(u)-[:GENDER]->(g:Gender)
                WHERE uu.username = $username and l.name = $city
                WITH DISTINCT u, h, l.name AS cityName, g.type AS genderType
                RETURN u, h, cityName, genderType, rand() as rand
                ORDER BY rand ASC
                LIMIT 3
                `,{username:username, city:city}
            )

            const houseworkers = result.records.map(el =>{
                let userInfo = {};
                const userNode = el.get(0).properties;
                const housworkerNode = el.get(1).properties;
                userInfo ={...userNode, ...housworkerNode, recommended:true}
                userInfo.city = el.get(2);
                userInfo.gender =el.get(3); 
                return userInfo;
            })

            await set("recommended:" + username, JSON.stringify(houseworkers))
            await expire("recommended:" + username, 10*60);

            return houseworkers;
        }
        else{
            return catchedData;
        }
    }
    catch(error){
        console.error("Error getting recommended users :", error.message); 
        throw new Error("Failed to get recommended users. Please try again later.");
    }
    finally{
        session.close();
    }
}

module.exports ={
    findByUsername:findByUsername,
    findAll:findAll,
    findByUsernameAndDelete,
    getRandomUsernames,
    getRandomUsernamesAndID,
    getAllComments,
    commentHouseworker,
    deleteComment,
    rateHouseworker,
    update,
    updateCity,
    updateGender,
    create,
    getInfo,
    getCity,
    recomendedByCityAndInterest
}