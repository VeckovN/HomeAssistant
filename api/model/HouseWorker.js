const { Session } = require('neo4j-driver');
const {session,driver} = require('../db/neo4j');

//MOST IMPORTANT THING WIHT REACT(AWAIT/ASYNC)-ASYNC CALL
//Neo4j can only handle single session at the same time, but async makes usually multiple  at same time 
//execute multiple calls and we MUST to session.close() after every session.run 
//becasuse second call don't have open session (we closed that session.close()) we have to create session on every call

//const session = driver.session(); CREATE NEW SESSION FOR EACH FUNCTIONS

const findByUsername = async (username)=>{
    const session = driver.session();
    const result = await session.run(
        'MATCH (n:User {username:$name})-[:IS_HOUSEWORKER]->() RETURN n',
        {name:username})
    if(result.records.length == 0){
        session.close();
        return null
    }
    else{
        const singleRecord = result.records[0];
        const node = singleRecord.get(0);
        const client = node.properties;
        session.close();
        return client;
    }
    
}

const findAll = async ()=>{
    //more than one is expected
    const session = driver.session();
    const result = await session.run(
        'Match(n:User)-[:IS_HOUSEWORKER]->() return n'
    )
    const clients = result.records.map(el=>{
        //return each clients propteries as object
        return el.get(0).properties;
    })
    session.close();
    return clients;
}


//FILTER
const findAllWithFilters = async(filters)=>{
    //all possible filterData
    const session = driver.session();
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
        
    var queryNeo4j = `
        Match(n:User)-[:IS_HOUSEWORKER]->(h:HouseWorker) \n
        MATCH(n)-[:LIVES_IN]->(c:City)
        MATCH(n)-[:GENDER]->(g:Gender)
        `
        ;

    var sortFlag = false
    if(sort==='RatingUp' || sort==='RatingDown')
        sortFlag=true;

    var orderBy='';
    var returnQ ='RETURN n, c.name, g.type \n';
    var where ='WHERE ';

    console.log("SORT FLAG: " + sortFlag);
    console.log("SORT:" + sort );

    // if(sortFlag){
    //     where='WHERE r.rating>0 AND '
    //     queryNeo4j+=`MATCH(h)<-[r:RATED]-() \n`
    // }
    // else{
    //     where='WHERE ';   
    // }

    var With='WITH n,h,c,g, ';
    var age = false;

    if(ageFrom!=0 || ageFrom!=100)
        age=true;

    //WHERE PART
    if(city!=undefined && gender!=undefined){
        where+=`c.name='${city}' AND g.type='${gender}'`
        // if(searchName!=undefined)
        //     where +=` AND n.username STARTS WITH '${searchName}' \n`
    }
    else{
        //Add match for each filter options
        if(city!=undefined)
            where+=`c.name='${city}' `
  
        if(gender!=undefined){
            if(where.trim().length > 5)
                where+=` AND g.type='${gender}'`;
            else
                where+=`g.type='${gender}'`;
        }
    }

    //if where not contain only WHERE THEN we need ADD operator
    //or if is only 'WHERE ' we dont need ADD operator 
    //WHERE_ with trim = 5characters
    console.log("WHERE: " + where);
    console.log("WHERE-LENGHT: " + where.trim().length)

    // if(age){
    //     if(where.trim().length > 5)
    //         where+=` AND n.ageFrom >= ${ageFrom} AND n.ageTo <=${ageTo} `
    //     else
    //         where+=`n.ageFrom >= ${ageFrom} AND n.ageTo <=${ageTo} `
    // }

    if(searchName!=undefined){
        if(where.trim().length > 5)
            where +=` AND n.username STARTS WITH '${searchName}' \n`
        else
            where+=`n.username STARTS WITH '${searchName}' \n`
    }


    //---------PROFESSIONS-------------
    


    if(sortFlag){
        if(where.trim().length > 5)
            where+=' AND r.rating>0 '
        else
            where+='r.rating>0'

        queryNeo4j+=`MATCH(h)<-[r:RATED]-() \n`
    }
    
    //ADDING WHERE PART TO QUERY
    // if(city!=undefined || gender!=undefined || ageFrom!=0 || ageTo!=100 || !searchName)
    if(city!=undefined || gender!=undefined || ageFrom!=0 || ageTo!=100 || searchName!=undefined || sortFlag)
        queryNeo4j+=where

    //Orderby
    if(sort!='ASC' )
        if(sort=="RatingUp" ){
            queryNeo4j+=`
            ${With} avg(r.rating) as avg_rating \n`
            orderBy+="ORDER BY avg_rating DESC \n"  
        }
        else if(sort=="RatingDown"){
            queryNeo4j+=`
                MATCH(h)<-[r:RATED]-()
                ${With} avg(r.rating) as avg_rating \n`
            orderBy+="ORDER BY avg_rating ASC \n"
        }
        else if(sort =="AgeUp"){
            orderBy+='ORDER BY n.age DESC \n'
        }
        else if(sort=="AgeDown")
            orderBy+='ORDER BY n.age ASC \n'
    else
        orderBy+='ORDER BY n.username ASC \n'

    //RETURN part --- concatenate return to query
    // queryNeo4j+= `RETURN n `
    queryNeo4j+=returnQ;
    queryNeo4j+=orderBy;
    queryNeo4j+=`LIMIT ${limit}`

    console.log("QUERY: " + queryNeo4j);
    console.log("PARAMS1: " + city + '/ ' + gender + '/' + searchName);

    const result = await session.run(queryNeo4j);
    const houseworkers = result.records.map(el =>{
        const hs = el.get(0).properties;
        hs.city = el.get(1);
        hs.gender =el.get(2); 
        //if rating exists
        // if(el.length == 4)
        //     hs.rating = el.get(3);
            // console.log("EXIST");
        return hs;
    })
    
    session.close();
    return houseworkers;

}




const findByUsernameAndDelete = async (username)=>{
    //User -[:IS_CLIENT]->Client
    //to delete a node it is necessery to DELTE THE RELATIONSHIP FIRST
    const session = driver.session();
    await session.run(
        "MATCH (n:User {username:$name})-[r:IS_HOUSEWORKER]->(m) DELETE r, n, m",
        {name:username}
    )
    //all others client
    session.close();
    return await findAll();
}

const getGender = async(username)=>{
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
        MATCH(n)-[:GENDER]->(g)
        RETURN g.type
    `,{houseworker:username})
    session.close();
    return result.records[0].get(0);
}

const getAge = async(username)=>{
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
        MATCH(n)-[:LIVES_IN]->(c)
        RETURN c.name
    `,{houseworker:username})
    session.close();
    return result.records[0].get(0)
}

//all Cities of Houseworkers
const findCities = async()=>{
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User)-[:IS_HOUSEWORKER]->(h)
        MATCH(n)-[:LIVES_IN]->(c:City)
        RETURN DISTINCT c.name
    `)
    const cities = result.records.map(el =>{
        return el.get(0);
    })
    console.log(cities);

    session.close();
    return cities;
}


//all rates
const getRatings = async(username)=>{
    const session = driver.session();
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

    var avgRating =0;
    var avgSum;
    if(ratings.length==0){
        session.close();
        return parseInt(0); //strict Int value (not Boolean)
    }
    //average rating
    if(ratings.length >=2){
        avgSum = ratings.reduce((rat1, rat2) => parseInt(rat1) + parseInt(rat2));  //0 start acc
        avgRating = avgSum / ratings.length;
    }
    else{

        session.close();
        // idk why return object {"low": 5,"high": 0} instead the value 5
        //and then prase it to INT
        return parseInt(ratings)

    }
        

    console.log("RATINGS: " + ratings);
    console.log("TYPEOF :" + JSON.stringify(ratings));
    console.log("TYPEOF :" + JSON.stringify(avgRating))
    console.log("AVG", avgRating);

    session.close();
    return avgRating;
}

const getComments = async()=>{
    const session = driver.session();
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
    session.close();
    return comments;
    //Example - 2 comments
    //records[0] records[1]
    //get(0)c, get(1)t NODE For each Records
}

const getProfessions = async ()=>{
    //Get Professions with working Hours
    const session = driver.session();
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
    session.close();
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
    session.close();
    return {profession:records[0].get(0), working_hour:records[0].get(1)}
}


//creating Houseworker without professions
const create = async(houseworkerObject)=>{
    const session = driver.session();
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
    MERGE(user)-[r:GENDER]->(g)

    MERGE(c:City {name:$city})
    MERGE(user)-[h:LIVES_IN]->(c)
    RETURN user,g.type,c.name
    `
    ,{username:username, email:email, password:password, first_name:first_name, last_name:last_name, picture:picture, address:address, description:description ,city:city, gender:gender}
    )

    const user = result.records[0].get(0).properties;
    const userGender = result.records[0].get(1);
    const userCity = result.records[0].get(2);

    session.close();
    return {
        user, gender:userGender, city:userCity
    }

}

//UNFINISHED
//!!!!!! we need also update relationships ->LIVES_IN and GENDER
const update = async(newValue)=>{
    const session = driver.session();
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
    session.close();
    return result.records[0].get(0).properties;
}

const updateCity = async(city)=>{
    const session = driver.session();
    const ourUsername = "Sara";
    const result = await session.run(`
        MATCH(n:User{username:$houseworker})
        MATCH(n)-[:LIVES_IN]->(c:City)
        Set c.name = $cityName
        return c.name
    `
    ,{houseworker:ourUsername, cityName:city}
    )
    
    session.close();
    return result.records[0].get(0);
}

const updateGender = async(gender)=>{
    const session = driver.session();
    const ourUsername = "Sara";
    const result = await session.run(`
        MATCH(n:User{username:$houseworker})
        MATCH(n)-[:GENDER]->(g:Gender)
        Set g.type = $gender
        return g.type
    `
    ,{houseworker:ourUsername, gender:gender}
    )

    session.close();
    return result.records[0].get(0);
}



/////////////////////////CHAT PART/////////////////













//////////////////////////////////////////////////////




module.exports ={
    findByUsername,
    findAll,
    findAllWithFilters,
    findByUsernameAndDelete,
    getGender,
    getAge,
    getRatings,
    getComments,
    getProfessions,
    addProfession,
    update,
    updateCity,
    updateGender,
    create,
    findCities

}