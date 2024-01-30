const { response } = require('express');
const {session,driver} = require('../db/neo4j');
const { use } = require('../routes/clients');
const { set, get, expire } = require('../db/redis');

//When is important to return all properties of Node
//we can return whole node with RETURN node and return records[0].get(0).properties

//But when we want to reture some properties not all of them
//we  can return those properties Return node.property1, node.property2


const findByUsername = async (username)=>{
    const session = driver.session();
    const result = await session.run(
        `MATCH (n:User {username:$name})-[:IS_CLIENT]->() 
        RETURN n`,
        {name:username})

    //if user not exists 
    console.log("RES: " + result.records.length );
    if(result.records.length == 0)
        return null
    else{
        const singleRecord = result.records[0];
        //whole OBject(node) (with all properies)
        const node = singleRecord.get(0);
        //to get all properties 
        const client = node.properties;

        //show result as JSON
        // console.log("ALL RESULTS: " + JSON.stringify(allResults));

        //THIS IS A PROMISE, We return a promise Because we used await to take get result from session.run
        //return object without password
        session.close();
        return client;
    }
}

const getCity = async(username)=>{
    const session = driver.session();

    const result = await session.run(
        `MATCH(n:User)-[:LIVES_IN]-(c)
        WHERE n.username = $username
        RETURN c.name `,
        {username:username}
    )

    const city = result.records[0].get(0);
    console.log("CIRTTTTTTT" + city);

    session.close();
    //all others client
    return city;
    
}

const getInfo = async (username) =>{
    const session = driver.session();
    //more than one is expected
    const result = await session.run(
        `MATCH(n:User {username:$name})-[:IS_CLIENT]->(c)
            MATCH(n)-[:GENDER]->(g)
            MATCH(n)-[:LIVES_IN]->(l)
            RETURN n,  g.type, l.name`
        ,{name:username}
    )

    //if there isn't users
    if(result.records.length == 0)
        //not good practice to return Error
        // return new Error("Client not exists")
        return []; 

    //one result -> [0]
    const clientProp = result.records[0].get(0).properties;
    const clientGender = result.records[0].get(1);
    const clientCity = result.records[0].get(2);

    //all properties excpets password
    const { password, ...clientInfo} = clientProp 

    //Add gender and city
    clientInfo.gender = clientGender;
    clientInfo.city = clientCity;

    console.log("CLIENT INFO: " + JSON.stringify(clientInfo));

    session.close();
    return clientInfo;
}

const findAll = async ()=>{
    const session = driver.session();
    //more than one is expected
    const result = await session.run(
        'Match(n:User)-[:IS_CLIENT]->() return n'
    )

    //if there isn't users
    if(result.records.length == 0)
        return []

    const clients = result.records.map(el=>{
        //return each clients propteries as object
        return el.get(0).properties;
    })

    session.close();
    return clients;
}

const findByUsernameAndDelete = async (username)=>{
    const session = driver.session();
    //User -[:IS_CLIENT]->Client
    //to delete a node it is necessery to DELTE THE RELATIONSHIP FIRST
    const result = await session.run(
        "MATCH (n:User {username:$name})-[r:IS_CLIENT]->(m) DELETE r, n, m",
        {name:username}
    )
    session.close();
    //all others client
    return await findAll();
}


const getAllComments = async (username)=>{
    const session = driver.session();
    const result = await session.run(`
    MATCH(n:Client {username:$name})-[r:COMMENTED]->(m)MATCH(m)-[b:BELONGS_TO]->(c) 
    RETURN m.context,c.username`,
    {name:username})

    //WHEN WE RETURN WHOLE NODE RETURN m, c;
    // const comments = result.records.map(rec=>{
    //     //rec.get(0) is first node -> Comment node --- rec.get(0).properties -> (context='example comentar')
    //     //rec.get(1) is seccodn node -> Houseworker node --- rec.get(1).properties ->(username="Sara", working_hours='200')
    //     //console.log("re: " + rec.get(0) + "re2: " +rec.get(1));
    //     const commentProperties = rec.get(0).properties;
    //     const houseWorkerProperties = rec.get(1).properties;
    //     return {comment:commentProperties.context, houseworker:houseWorkerProperties.username}
    // });

    const comments = result.records.map(rec=>{
        //rec.get(0) is first node -> Comment node --- rec.get(0).properties -> (context='example comentar')
        //rec.get(1) is seccodn node -> Houseworker node --- rec.get(1).properties ->(username="Sara", working_hours='200')
        //console.log("re: " + rec.get(0) + "re2: " +rec.get(1));
        return {comment:rec.get(0), houseworker:rec.get(1)}
    });

    session.close();
    return comments;

}
//comments.records;
// [
//     Record {
//       keys: [ 'm', 'c' ],
//       length: 2,
//       _fields: [ [Node], [Node] ],
//       _fieldLookup: { m: 0, c: 1 }
//     },
//     Record {
//       keys: [ 'm', 'c' ],
//       length: 2,
//       _fields: [ [Node], [Node] ],
//       _fieldLookup: { m: 0, c: 1 }
//     }
//   ]


const commentHouseworker = async(client, houseworker, comment)=>{
    const session = driver.session();

    const result = await session.run(`
    MATCH (n:Client {username:$client})
    MATCH (m:HouseWorker {username:$houseworker})
    CREATE (c:Comment {context:$comment})
    CREATE (n)-[:COMMENTED]->(c)
    CREATE (c)-[:BELONGS_TO]->(m)
    RETURN ID(c) AS commentID`
    , {client:client, houseworker:houseworker, comment:comment}
    )

    const commentID = parseInt(result.records[0].get(0));

    session.close();
    return commentID;
}


const deleteComment = async(username, commentID)=>{
    const session = driver.session();

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

    session.close();
    return result.records[0];
}


const rateHouseworker= async(client, houseworker, rating)=>{
    const session = driver.session();
    //MARGE - ON MATCH SET - when Relationship exist we wanna set new rating value not to create another relationsip
    const result = await session.run(`
        MATCH(n:Client {username:$client})
        MATCH(m:HouseWorker {username:$houseworker})
        MERGE (n)-[r:RATED]->(m)
        ON CREATE SET r.rating = $rating
        ON MATCH  SET r.rating = $rating
        RETURN r.rating
    `,{client:client, houseworker:houseworker, rating:rating}
    );

    //records[0] is record of n(Node Client)
    //records[2] is the r(relationship:RATED w)
    console.log("RATING : " + result.records[0].get(0))
    session.close();
    return result.records[0].get(0);
    //or return n,m,r.rating
    //return result.records[2].get(0)
}

const rateHouseworker_client = async(client, username, rating)=>{
    const session = driver.session();
    // const ourUsername ="Novak";

    //MARGE - ON MATCH SET - when Relationship exist we wanna set new rating value not to create another relationsip
    const result = await session.run(`
        MATCH(n:Client {username:$client})
        MATCH(m:HouseWorker {username:$houseworker})
        MERGE (n)-[r:RATED]->(m)
        ON CREATE SET r.rating = $rating
        ON MATCH  SET r.rating = $rating
        RETURN r.rating
    `,{client:client, houseworker:username, rating:rating}
    );

    //records[0] is record of n(Node Client)
    //records[2] is the r(relationship:RATED w)
    console.log("RATING : " + result.records[0].get(0))
    return result.records[0].get(0);
    //or return n,m,r.rating
    //return result.records[2].get(0)
}

const addInterest = async(username, interest) =>{
    const session = driver.session();

    await session.run(` 
        MATCH(n:User {username:$client})-[:IS_CLIENT]->(m)
        MATCH(p:Profession {title:$profession})
        MERGE(m)-[r:INTEREST]->(p)
        RETURN p.title`,
    {client:username, profession:interest})

    session.close()
}

const create = async(clientObject)=>{

    const session = driver.session();
    const {id, username, email, password, firstName, lastName, picturePath, city, gender, interests} = clientObject;

    //WITH Clause is necessary between Create and Other part of query(Create Gender and City)
    const result = await session.run(`
    CREATE (n:User 
        {
            id:$id,
            username:$username, 
            email:$email, 
            password:$password, 
            first_name:$firstName,
            last_name:$lastName,
            picturePath:$picturePath
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
    ,{id:id, username:username, email:email, password:password, firstName:firstName, lastName:lastName, picturePath:picturePath, city:city, gender:gender, interests:interests}
    )

    //Interests relation between profession and Client
    const interestsArray = interests.split(',');
    console.log("PROFESSIONS: " + interests);
    console.log("PROFESSIONSArray: " + JSON.stringify(interestsArray));
    console.log("PROF: TYPEOF: " + typeof(interests));
    console.log("PROF: TYPEOF ARRRAY: " + typeof(interestsArray));
    //add professions
    interestsArray.forEach(interest => {
        console.log("PT: " + interest); 
        addInterest(username, interest);
    });


    const user = result.records[0].get(0).properties;
    const userGender = result.records[0].get(1);
    const userCity = result.records[0].get(2);
    session.close();
    return {
        user, gender:userGender, city:userCity
    }

}

//update only client NODE property
const update = async(username, newValue)=>{
    const session = driver.session();
    //newValue must have same property as Client NODE
    // email	"novak@gmail.com"
    // first_name	"Novak"
    // last_name	"Veckov"
    // password	"pw1"
    // picture	"/"
    // username "Novak"

    const result = await session.run(`
        MATCH (n:User { username: $client})
        SET n += $object
        RETURN n
    `,{client:username, object:newValue}
    )
    // const result = await session.run(`
    //     MATCH (n:User { username: "Novak"})
    //     SET n += { password:"pwww" , picture:"//" }
    // `
    // )
    session.close();
    return result.records[0].get(0).properties;
}

//update City node with [:LIVES_IN]
const updateCity = async(username, city)=>{
    const session = driver.session();

    const result = await session.run(`
        MATCH(n:User{username:$client})
        MATCH(n)-[:LIVES_IN]->(c:City)
        Set c.name = $cityName
        return c.name
    `
    ,{client:username, cityName:city}
    )

    session.close();
    return result.records[0].get(0);
}

const updateGender = async(gender)=>{
    const session = driver.session();
    const ourUsername = "Sara";
    const result = await session.run(`
        MATCH(n:User{username:$client})
        MATCH(n)-[:GENDER]->(g:Gender)
        Set g.type = $gender
        return g.type
    `
    ,{client:ourUsername, gender:gender}
    )

    session.close();
    return result.records[0].get(0);
}


//----------RECOMMENDATIONS

const interestedProfessions = async(professions)=>{
    // MATCH(n:User)-[:IS_HOUSEWORKER]->(h)-[:OFFERS]-(p:Profession {title:"Kuvar"}) return h, count(h) as add
    // ORDER BY add desc
    // LIMIT 5
}
 
const checkRecommendedInCache = async(username) =>{
    const data = await get("recommended:" + username);
    if(data){
        const dataObj = JSON.parse(data);
        return dataObj
    }
    else
        return null
}


const recomendedByCityAndInterest = async(username,city) =>{
    const session = driver.session();

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
            //gotted id{"low":0,"high":0} it MUST parse to INT
            userInfo.city = el.get(2);
            userInfo.gender =el.get(3); 
            //console.log("USER INFOOOO : " + JSON.stringify(userInfo));
            return userInfo;
        })

        await set("recommended:" + username, JSON.stringify(houseworkers))
        await expire("recommended:" + username, 10*60);

        session.close();
        return houseworkers;
    }
    else{
        session.close();
        return catchedData;
    }

}

module.exports ={
    findByUsername:findByUsername,
    findAll:findAll,
    findByUsernameAndDelete,
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