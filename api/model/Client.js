const { response } = require('express');
const session = require('../db/neo4j');

// const findAll = async()=>{


// }

const findByUsername = async (username)=>{

    const result = await session.run(
        'MATCH (n:User {username:$name})-[:IS_CLIENT]->() RETURN n',
        {name:username})

    
    const singleRecord = result.records[0];

    //whole OBject(node) (with all properies)
    const node = singleRecord.get(0);
    //to get all properties 
    const client = node.properties;

    //show result as JSON
    // console.log("ALL RESULTS: " + JSON.stringify(allResults));

    //THIS IS A PROMISE, We return a promise Because we used await to take get result from session.run
    //return object without password
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
        "MATCH (n:User {username:$name})-[r:IS_CLIENT]->(m) DELETE r, n, m",
        {name:username}
    )
    //all others client
    return await findAll();
}

const getAllComments = async (username)=>{
    const result = await session.run("MATCH(n:Client {username:$name})-[r:COMMENTED]->(m)MATCH(m)-[b:BELONGS_TO]->(c) RETURN m,c",
    {name:username})

    const comments = result.records.map(rec=>{
        //rec.get(0) is first node -> Comment node --- rec.get(0).properties -> (context='example comentar')
        //rec.get(1) is seccodn node -> Houseworker node --- rec.get(1).properties ->(username="Sara", working_hours='200')
        //console.log("re: " + rec.get(0) + "re2: " +rec.get(1));
        const commentProperties = rec.get(0).properties;
        const houseWorkerProperties = rec.get(1).properties;
        return {comment:commentProperties.context, houseworker:houseWorkerProperties.username}
    });

    return comments;

    //expected structure
    // [
    //     { comment: 'Very responsible', houseworker: 'Sara' },
    //     { comment: 'Hardworker and good person', houseworker: 'Marko' }

    // ]
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


module.exports ={
    findByUsername:findByUsername,
    findAll:findAll,
    findByUsernameAndDelete:findByUsernameAndDelete,
    getAllComments:getAllComments

}