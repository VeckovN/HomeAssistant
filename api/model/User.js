//Use Could be HouseWorker or Client
const session = require('../db/neo4j');

//All modal function return result as promise

//All Client and HouseWorker users
const findAll = async ()=>{

    const result = await session.run('MATCH (n:User) Return n')

    const users = result.records.map(el=>{
        return el.get(0).properties;
    })

    return users;
}

const findByUsername = async (username)=>{
    const result = await session.run(
        "MATCH (n:User {username:$name} RETURN n)",
        {name:username}
    )
    const user = result.records[0].get(0).properties;

    return user;
}




module.exports = {
    findAll:findAll,
    findByUsername:findByUsername

}
