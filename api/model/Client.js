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

const commentHouseworker = async(username, comment)=>{

    //our (CLient) username from LocalStore or cookie
    const ourUsername = 'Novak'; //client

    const result = await session.run(`
    MATCH (n:Client {username:$client})
    MATCH (m:HouseWorker {username:$houseworker})
    CREATE (c:Comment {context:$comment})
    CREATE (n)-[:COMMENTED]->(c)
    CREATE (c)-[:BELONGS_TO]->(m)
    RETURN c`
    , {client:ourUsername, houseworker:username, comment:comment}
    )

    const commentResult = result.records[0].get(0).properties;

    return commentResult;
    
}
const deleteComment = async(username, commentID)=>{
    const ourUsername = "Novak";

    const result = await session.run(`
    MATCH(n:Client {username:$client})
    MATCH(m:Houseworker {username:$houseworker})
    MATCH(c:Comment {id:$commentID})
    MATCH(n)-[r:COMMENTED]->(c)
    MATCH(c)-[t:BELONGS_TO]->(m)
    DELETE r,t,c
    RETURN n`
    , {client:ourUsername, houseworker:username, id:commentID}
    )

    //client is returned
    return result.records[0].get(0).properties;
}

const rateHouseworker = async(username, rating)=>{
    const ourUsername ="Novak";

    const result = await session.run(`
    MATCH(n:Client {username:$client})
    MATCH(m:HouseWorker {username:$houseworker})
    CREATE(n)-[r:RATED {rating:$rating}]->(m)
    RETURN n, m, r

    `,{client:ourUsername, houseworker:username, rating:rating}
    );

    //records[0] is record of n(Node Client)
    //records[2] is the r(relationship:RATED w)

    console.log("RRATE: " + result.records[2].get(0).properties.rating)
    return result.records[2].get(0).properties.rating;
}


//TEST THIS
const update = async(username, newValue)=>{

    //newValue must have same property as Client NODE
    // address	"Zorana Gudzica"
    // description	"Ambitious, rasponsible, hardworker"
    // email	"novak@gmail.com"
    // first_name	"Novak"
    // last_name	"Veckov"
    // password	"pw1"
    // picture	"/"
    // username "Novak"

    const ourUsername ="Novak";

    const result = await session.run(`
        MATCH (n:User { username: $client})
        SET n += { $object }
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







//CHATING 






module.exports ={
    findByUsername:findByUsername,
    findAll:findAll,
    findByUsernameAndDelete,
    getAllComments,
    commentHouseworker,
    deleteComment,
    rateHouseworker,
    update,

}