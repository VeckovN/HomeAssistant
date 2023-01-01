const { Session } = require('neo4j-driver');
const session = require('../db/neo4j');

const findByUsername = async (username)=>{
    const result = await session.run(
        'MATCH (n:User {username:$name})-[:IS_HOUSEWORKER]->() RETURN n',
        {name:username})
    if(result.records.length == 0)
        return null
    else{
        const singleRecord = result.records[0];
        const node = singleRecord.get(0);
        const client = node.properties;
        return client;
    }
}

const findAll = async ()=>{
    //more than one is expected
    const result = await session.run(
        'Match(n:User)-[:IS_HOUSEWORKER]->() return n'
    )
    const clients = result.records.map(el=>{
        //return each clients propteries as object
        return el.get(0).properties;
    })
    return clients;
}


//FILTER
const findAllWithFilters = async(filters)=>{
    //all possible filterData
    const {
        limit = 10, //default value 10 (if isn't seted)
        sort = 'ASC',
        city,
        gender, 
        ageFrom = 0, //set on 0(low limit)
        ageTo = 100, //set on 100(high limit)
        professions,  
        name:searchName, 
    } = filters;

    console.log("PROPS: " + "limit: " + limit + "/" + "sort: " + sort + "/" + "city: " + city + "/" + "ageFrom: " + ageFrom + "/" + "ageTo: " + ageTo + '/' + "gender: " + gender + "/" + "name: " + searchName + "/" + 'professions: ' + professions)
        
    var queryNeo4j = 'Match(n:User)-[:IS_HOUSEWORKER]->(h:HouseWorker) \n';
    var orderBy='';

    //Add match for each filter options
    if(city!=undefined)
        queryNeo4j +=`MATCH(n)-[:LIVES_IN]->(c:City {name:'${city}'}) \n`
    if(gender!=undefined)
        queryNeo4j +=`MATCH(n)-[:GENDER]->(g:Gender {type:'${gender}'}) \n`
    
    //whatevery age is seted use filter, if they aren'y set we don't need filter 
    // if(ageFrom!=undefined || ageFrom!=undefined)
    //     queryNeo4j +=`WHERE n.ageFrom >= ${ageFrom} AND n.ageTo <=${ageTo} `
    
    if(searchName!=undefined)
        queryNeo4j +=`WHERE n.username STARTS WITH '${searchName}' \n`


    //Orderby
    if(sort!='ASC' )
        if(sort=="RatingUp" ){
            queryNeo4j+=`
                MATCH(h)<-[r:RATED]-() \n
                WITH n, avg(r.rating) as avg_rating \n`
            orderBy="ORDER BY avg_rating DESC \n"
        }
        else if(sort=="RatingDown"){
            queryNeo4j+=`
                MATCH(h)<-[r:RATED]-()
                WITH n, avg(r.rating) as avg_rating \n`
            orderBy="ORDER BY avg_rating ASC \n"
        }
        else if(sort =="AgeUp"){
            orderBy='ORDER BY n.age DESC \n'
        }
        else if(sort="AgeDown")
            orderBy='ORDER BY n.age ASC \n'
    else
        orderBy ='ORDER BY n.username ASC \n'

    //RETURN part
    queryNeo4j+= `RETURN n \n`

    queryNeo4j+=orderBy;
    queryNeo4j+=`LIMIT ${limit}`

    console.log("QUERY: " + queryNeo4j);
    console.log("PARAMS1: " + city + '/ ' + gender + '/' + searchName);

    const result = await session.run(queryNeo4j);
    const houseworkers = result.records.map(el =>{
        return el.get(0).properties;
    })
    return houseworkers;

}




const findByUsernameAndDelete = async (username)=>{
    //User -[:IS_CLIENT]->Client
    //to delete a node it is necessery to DELTE THE RELATIONSHIP FIRST
    await session.run(
        "MATCH (n:User {username:$name})-[r:IS_HOUSEWORKER]->(m) DELETE r, n, m",
        {name:username}
    )
    //all others client
    return await findAll();
}



//all rates
const getRatings = async(username)=>{
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(m)<-[r:RATED]-() return r.rating`,
        {houseworker:username}
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
    console.log("RATINGGG:" +  ratings);

    var avgRating =0;
    var avgSum;
    if(ratings.length==0)
        return 0
    //average rating
    if(ratings.length >=2){
        avgSum = ratings.reduce((rat1, rat2) => parseInt(rat1) + parseInt(rat2));  //0 start acc
        avgRating = avgSum / ratings.length;
    }
    else
        return ratings

    console.log("RATINGS: " + ratings);
    console.log("AVG", avgRating);
    return avgRating;
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


//creating Houseworker without professions
const create = async(houseworkerObject)=>{
    //houseworkerObject
    // {
    //     username:"Sara", 
    //     email:"sara@gmail.com", 
    //     password:"pw1", 
    //     first_name:"Sara",
    //     last_name:"Veckov",
    //     picture:"/",
    //     city:"Nis",
    //     address:"Mokranjceva",
    //     description:"Ambicious, Hardworker",
    //     gender:"Male"
    // }

    const {username, email, password, first_name, last_name, picture, address, description, city, gender} = houseworkerObject;

    //WITH Clause is necessary between Create and Other part of query(Create Gender and City)
    const result = await session.run(`
    CREATE (n:User 
        {
            username:$username, 
            email:$email, 
            password:$password, 
            first_name:$first_name,
            last_name:$last_name,
            picture:$picture,
            address:$address,
            description:$description
        }
        ) 
        -[:IS_HOUSEWORKER]->
        (
         m:HouseWorker
         {
             username:$username     
         })
    WITH n as user , m as houseworker
    Match(g:Gender {type:$gender})
    CREATE(user)-[r:GENDER]->(g)

    MERGE(c:City {name:$city})
    MERGE(user)-[h:LIVES_IN]->(c)
    RETURN user,g.type,c.name
    `
    ,{username:username, email:email, password:password, first_name:first_name, last_name:last_name, picture:picture, address:address, description:description ,city:city, gender:gender}
    )

    const user = result.records[0].get(0).properties;
    const userGender = result.records[0].get(1);
    const userCity = result.records[0].get(2);
    return {
        user, gender:userGender, city:userCity
    }

}

//UNFINISHED
//!!!!!! we need also update relationships ->LIVES_IN and GENDER
const update = async(newValue)=>{
    const ourUsername ="Sara";    
    const result = await session.run(`
        MATCH (n:User { username: $houseworker})
        SET n += $object
        RETURN n
    `,{houseworker:ourUsername, object:newValue}
    )

    //check there is gender and city passed as wanted parametar to update

    if('')
    // const result = await session.run(`
    //     MATCH (n:User { username: "Novak"})
    //     SET n += { password:"pwww" , picture:"//" }
    // `
    // )
    return result.records[0].get(0).properties;
}

const updateCity = async(city)=>{
    const ourUsername = "Sara";
    const result = await session.run(`
        MATCH(n:User{username:$houseworker})
        MATCH(n)-[:LIVES_IN]->(c:City)
        Set c.name = $cityName
        return c.name
    `
    ,{houseworker:ourUsername, cityName:city}
    )
    
    return result.records[0].get(0);
}

const updateGender = async(gender)=>{
    const ourUsername = "Sara";
    const result = await session.run(`
        MATCH(n:User{username:$houseworker})
        MATCH(n)-[:GENDER]->(g:Gender)
        Set g.type = $gender
        return g.type
    `
    ,{houseworker:ourUsername, gender:gender}
    )

    return result.records[0].get(0);
}



/////////////////////////CHAT PART/////////////////













//////////////////////////////////////////////////////




module.exports ={
    findByUsername,
    findAll,
    findAllWithFilters,
    findByUsernameAndDelete,
    getRatings,
    getComments,
    getProfessions,
    addProfession,
    update,
    updateCity,
    updateGender,
    create

}