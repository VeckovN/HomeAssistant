const { Session } = require('neo4j-driver');
const session = require('../db/neo4j');

const findByUsername = async (username)=>{
    const result = await session.run(
        'MATCH (n:User {username:$name})-[:IS_HOUSEWORKER]->() RETURN n',
        {name:username})
    const singleRecord = result.records[0];
    const node = singleRecord.get(0);
    const client = node.properties;
    return client;
}

const findAll = async ()=>{
    //more than one is expected
    const result = await session.run(
        'Match(n:User)-[:IS_CLIENT]->() return n'
    )
    const clients = result.records.map(el=>{
        //return each clients propteries as object
        return el.get(0).properties;
    })
    return clients;
}

const findByUsernameAndDelete = async (username)=>{
    //User -[:IS_CLIENT]->Client
    //to delete a node it is necessery to DELTE THE RELATIONSHIP FIRST
    const result = await session.run(
        "MATCH (n:User {username:$name})-[r:IS_HOUSEWORKER]->(m) DELETE r, n, m",
        {name:username}
    )
    //all others client
    return await findAll();
}

//all rates
const getRatings = async()=>{
    const ourUsername ="Sara";
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(m)<-[r:RATED]-() return r.rating`,
        {houseworker:ourUsername}
    )
    //return array of propertie rating(return r)
    // const ratings = result.records.map(rec =>{
    //     return rec.get(0).properties.ratings
    // })

    //return r.rating
    //get(0)takes first returned element (r is first and last in this query) , 
    const ratings = result.records.map(rec =>{
        return rec.get(0);
    })

    console.log("RATINGS: " + ratings);
    return ratings;
}

const getComments = async()=>{
    const ourUsername ="Sara";
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(c:Comment)-[:BELONGS_TO]->(m)
        MATCH(c)<-[:COMMENTED]-(t)
        RETURN c.context, t.username`,
    {houseworker:ourUsername}
    )
    //{Comment:context, From:'clientUsername'}
    const comments = result.records.map(rec=>{
        let commentProp = rec.get(0);
        let clientProp = rec.get(1);
        return {comment:commentProp, from:clientProp}
    }) 
    return comments;
    //Example - 2 comments
    //records[0] records[1]
    //get(0)c, get(1)t NODE For each Records
}

const getProfessions = async ()=>{
    //Get Professions with working Hours
    const ourUsername ="Sara";
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(m)-[r:OFFERS]->(p)
        return p.title,r.working_hour`,
        {houseworker:ourUsername}
    )
    const professions = result.records.map(rec =>{
        //title ='Dadilja" npr (rec.get(0) is WHOLE NODE and has the properties, while rec.get(1) ->r.working_hour is returned property)
        return {profession:rec.get(0) , working_hour:rec.get(1)}
    })

    return professions;
}


const addProfession = async(profession, working_hour)=>{
    const ourUsername ="Sara";
    //MERGE INSTEAD CREATE(m)-[r:OFFERS]->(p)
    //PREVENT TO CREATE MULTIPLE TIMES SAME 'OFFER' RELATIONSHIP
    //(If there is the Offers relationship it will be returned not created )
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(p:Profession {title:$profession})
        MERGE(m)-[r:OFFERS {working_hour:$hour}]->(p)
        RETURN p.title, p.working_hour`,
    {houseworker:ourUsername, profession:profession, hour:working_hour}
    )

    //title of added profession
    // return result.records[0].get(0).properties.title;
    //or RETURN p.title
    return {profession:records[0].get(0), working_hour:records[0].get(1)}

}


const update = async(newValue)=>{
    const ourUsername ="Sara";    
    const result = await session.run(`
        MATCH (n:User { username: $client})
        SET n += $object
        RETURN n
    `,{client:ourUsername, object:newValue}
    )
    // const result = await session.run(`
    //     MATCH (n:User { username: "Novak"})
    //     SET n += { password:"pwww" , picture:"//" }
    // `
    // )
    return result.records[0].get(0).properties;
}


module.exports ={
    findByUsername,
    findAll,
    findByUsernameAndDelete,
    getRatings,
    getComments,
    getProfessions,
    addProfession,
    update

}