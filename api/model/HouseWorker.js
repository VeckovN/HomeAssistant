const bcrypt = require('bcrypt');
const { address } = require('ip');
const { Session } = require('neo4j-driver');
const {session,driver} = require('../db/neo4j');
const { set ,get, expire} = require('../db/redis');

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

// const getHouseworkerUsername = async ()=>{
//     const session = driver.session();
//     const result = await session.run(
//         'MATCH (n:User {username:$name})-[:IS_HOUSEWORKER]->() RETURN h.username',
//         {name:username})
//     if(result.records.length == 0){
//         session.close();
//         return null
//     }
//     else{
//         const singleRecord = result.records[0];
//         const node = singleRecord.get(0);
//         const client = node.properties;
//         session.close();
//         return client;
//     }
// }

const getInfo = async(username)=>{
    const session = driver.session();
    //more than one is expected
    const result = await session.run(
        `MATCH(n:User {username:$name})-[:IS_HOUSEWORKER]->(h)
            MATCH(n)-[:GENDER]->(g)
            MATCH(n)-[:LIVES_IN]->(l)
            RETURN n, h, g.type, l.name`
        ,{name:username}
    )

    if(result.records.length == 0)
        return []; 

    const userProp = result.records[0].get(0).properties;
    const houseworkerProp = result.records[0].get(1).properties;
    const houseworkerGender = result.records[0].get(2);
    const houseworkerCity = result.records[0].get(3);

    const {password, ...houseworkerInfo} = userProp;

    //props from Houseworker Node
    houseworkerInfo.address = houseworkerProp.address;
    houseworkerInfo.phone_number = houseworkerProp.phone_number;
    houseworkerInfo.description = houseworkerProp.description;
    
    //Gender and city
    houseworkerInfo.gender = houseworkerGender;
    houseworkerInfo.city = houseworkerCity;

    console.log("HOUSEWORRK PROP " + JSON.stringify(houseworkerProp));
    console.log("HOUSEWORKER INFO " + JSON.stringify(houseworkerInfo));

    session.close();
    return houseworkerInfo;
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


const checkFilterHouseworkerInCache = async (filters)=>{

    //filter query =?

    const filter = JSON.stringify(filters);
    
    console.log("FILTERS: " + filter);
    //fillter will be key in REDIS DB

    const data = await get(filter); //this is clasic string -> that is ok structure for this
    //becasue we store houseworkers as JSON()
    console.log("DATA: " + data);

    if(data){
        //cache hit
        const dataObj = JSON.parse(data);
        return dataObj
    }
    else{
        //no houseworker with filters in DB
        return null;
    }
    //houseworker list will be Value in RedisDb
}

//FILTER
const findAllWithFilters = async(filters)=>{
    //all possible filterData
    const session = driver.session();
    
    //-----------This is only when is scroll triggerted----------
    //using Limit and skip CLAUSES in neo4j
    //Limit is same as itemsPerPage (limit = itemsPerPage)
    //skipCount = pageNumber * itemsPerPage

    //inital pageNumber = 0 limit = 10 SKIP = (0 * 10 = 0) don't skip (show all that limit said) LIMIT = itemsPerPage(10)  --> from 0 to 10(10 isn't included)
    //second pageNubmer = 1 limit = 10 SKIP = (1* 10 = 10) that means skip first 10(0-9) -> go with index 10  LIMIT = itemsPerPage(10) ---> and return 10 new (start index:10 + 10new (10-19) index is returned)
    //thirtd pageNumber = 2 limit = 10 SKIP = (2* 20 = 20) skip first 20 (0-19) -> go with index 20 LIMIT = itemsPerpage(10) => start index is:20 + 10 new that means (data with index of 20,21,22,23,24,25,26,27,28,29) is returned

    //but with Skip and Limit that take 0 - and 9 index as count of 10 -> we don't need this ItemsPerPage -1 

    //neo4j query should looks 
    // MATCH (n:User)-[:IS_HOUSEWORKER]->(h:HouseWorker)
    // MATCH (n)-[:LIVES_IN]->(c:City)
    // MATCH (n)-[:GENDER]->(g:Gender)
    // MATCH (h)-[o:OFFERS]->(p:Profession)
    // WHERE c.name = 'Nis' AND g.type = 'Male' AND p.title IN ["Cistac"]
    // RETURN n, h, c.name, g.type
    // SKIP $skipCount // This value will be calculated based on the page number and items per page
    // LIMIT $limitCount // This value represents the number of items per page
        
    //CHALLANGE how to manage catched REDIS data()    
        
    const {
        limit = 10, //default value 10 (if isn't seted)
        itemsPerPage = 2,
        pageNumber,
        sort = 'ASC',
        city,
        gender, 
        // ageFrom = 0, //set on 0(low limit)
        // ageTo = 100, //set on 100(high limit)
        ageFrom,
        ageTo,
        professions,  
        name:searchName, 
    } = filters;
        
    //CHECK FOR CACHE
    console.log("FIL:L:LLL : " + JSON.stringify(filters));
    const catchData = await checkFilterHouseworkerInCache(filters);

    console.log("SSSSSSSS: " + catchData);
    
    if(catchData==null){
        console.log("\n CATCH NOTTTT EXISSSSSSSSSTTTTTTTSSSS \n");
        //SET and WITH after MATCH(h)<-[r:RATED] if exists
        var queryNeo4j = `
            Match(n:User)-[:IS_HOUSEWORKER]->(h:HouseWorker) \n
            MATCH(n)-[:LIVES_IN]->(c:City)
            MATCH(n)-[:GENDER]->(g:Gender) 
            `;

        if(professions)
            if(professions.length>0)
                    queryNeo4j +=`MATCH(h)-[o:OFFERS]->(p:Profession) \n`
            
        var sortFlag = false
        if(sort==='RatingUp' || sort==='RatingDown')
            sortFlag=true;

        var orderBy='';
        var returnQ ='RETURN  n, h, c.name, g.type \n';
        var where ='WHERE ';
        var With='WITH n,h,c,g ';
        var age = false;
        var skipCount = pageNumber * itemsPerPage;

        console.log("PAGE Number " + pageNumber)
        console.log("ITEMS PER PAGE" + itemsPerPage);

        
        console.log("AGEEEEEEEEEEEEEEEEEEEE " + age);

        //WHERE PART
        if((city!=undefined && city!='') && (gender!=undefined && city!='')){
            where+=`c.name='${city}' AND g.type='${gender}'`
            // if(searchName!=undefined)
            //     where +=` AND n.username STARTS WITH '${searchName}' \n`
        }
        else{
            //Add match for each filter options
            if(city!=undefined && city!='')
                where+=`c.name='${city}' `
    
            if(gender!=undefined && gender!=''){
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

        if((ageTo!=undefined && ageTo!= '')||( ageFrom!=undefined && ageFrom!= '')){
            if(where.trim().length > 5)
                where+=` AND h.age >= '${ageFrom}' AND h.age <='${ageTo}' `
            else
                where+=`h.age > '${ageFrom}' AND h.age < '${ageTo}' `
        }

        if(searchName!=undefined && searchName!= ''){
            if(where.trim().length > 5)
                where +=` AND n.username STARTS WITH '${searchName}' \n`
            else
                where+=`n.username STARTS WITH '${searchName}' \n`
        }

        var professionsLength = 0;
        //---------PROFESSIONS-------------
        if(professions){            
            let professionsArray = professions.split(',');
            professionsLength = professionsArray.length;
            console.log("ARRATYYY: " + professions);
            console.log("ARRATYYY2: " + professionsArray[0]);
            console.log("LENGHT PROF ARR " + professionsLength)
            if(professionsLength>0)
            {
                let professionString = '';
                if(professionsLength ==1)
                    professionString += `"${professions}"`;
                else{
                    //example 4 profes(staratelj Kuvar Bastovan Dadilja)
                                //0         1           2           3
                    //we got ("Staratelj ," "Kuvar ," "Bastovan ," "Dadilja")
                    // last comma after 2 index 
                    // console.log("PROSSSSSSSSSSS: " +  ); 
                    for(let i=0; i<professionsLength; i++){
                        if(i<professionsLength-1) //0,1,2  --- <4-1
                            professionString+= `"${professionsArray[i]}" ,`
                        else    
                            professionString+= `"${professionsArray[i]}" `;
                    }
                }
                
                console.log("RPOFSSFSFFS: " + professionString)
                if(where.trim().length > 5){
                    where+= ` AND p.title IN [${professionString}] `
                    console.log("TEST1");
                }
                    // where+= ` AND p.title IN [${professionString}]`
                else{
                    where+= `p.title IN [${professionString}] `
                    console.log("TEST2");
                }
                    
            }
            
        }
                
        if(sortFlag){
            if(where.trim().length > 5)
                where+=' AND r.rating>0 '
            else
                where+='r.rating>0'

            queryNeo4j+=`MATCH(h)<-[r:RATED]-() \n`
        }
        
        //ADDING WHERE PART TO QUERY
        // if(city!=undefined || gender!=undefined || ageFrom!=0 || ageTo!=100 || !searchName)
        if((city!=undefined && city!='' )||( gender!=undefined && gender!='' )|| (ageTo!=undefined && ageTo!= '') || (ageFrom!=undefined && ageFrom!= '')||( searchName!=undefined && searchName!='') || sortFlag || professionsLength>0)
            queryNeo4j+=where

        //Orderby
        if(sort!='ASC' )
            if(sort=="RatingUp" ){
                queryNeo4j+=`
                ${With} , avg(r.rating) as avg_rating \n`
                orderBy+="ORDER BY avg_rating DESC \n"  
            }
            else if(sort=="RatingDown"){
                queryNeo4j+=`
                    MATCH(h)<-[r:RATED]-()
                    ${With} , avg(r.rating) as avg_rating \n`
                orderBy+="ORDER BY avg_rating ASC \n"
            }
            else if(sort =="AgeUp"){
                orderBy+=`${With} ORDER BY h.age DESC \n`
            }
            else if(sort=="AgeDown")
                orderBy+=`${With} ORDER BY h.age ASC \n`
        else
            orderBy+='ORDER BY n.username ASC \n'

        //RETURN part --- concatenate return to query
        // queryNeo4j+= `RETURN n `
        queryNeo4j+=orderBy;
        queryNeo4j+=returnQ;
        // queryNeo4j+=orderBy;
        // queryNeo4j+=`LIMIT ${limit}`

        // //Infinity Scroll (SKIP AND LIMIT clausules)
        queryNeo4j+=`SKIP ${skipCount} \n`
        queryNeo4j+=`LIMIT ${itemsPerPage}`

        console.log("QUERY: \n" +  queryNeo4j + "\n");
        console.log("PARAMS1: " + city + '/ ' + gender + '/' + searchName);

        const result = await session.run(queryNeo4j);
        const houseworkers = result.records.map(el =>{
            let userInfo = {};
            const userNode = el.get(0).properties;
            const housworkerNode = el.get(1).properties;
            userInfo ={...userNode, ...housworkerNode}
            //gotted id{"low":0,"high":0} it MUST parse to INT
            userInfo.city = el.get(2);
            userInfo.gender =el.get(3); 

            //console.log("USER INFOOOO : " + JSON.stringify(userInfo));

            return userInfo;
        })

        // //STORE(CATCH) FILTERED HOYUSEWORKER IN REDIS 
        await set(JSON.stringify(filters), JSON.stringify(houseworkers))
        await expire(JSON.stringify(filters), 10*60);
        // //with TTL 10 min
        
        session.close();
        return houseworkers;
    }
    else{
        console.log("\n CATCH EXISSSSSSST \n");
        //Filtered Houseworker exist in Catch
        return catchData;
    }

}

// const getRecommended = async(username) =>{
    

// }

const findByUsernameAndDelete = async (username)=>{
    //User -[:IS_CLIENT]->Client
    //to delete a node it is necessery to DELTE THE RELATIONSHIP FIRST
    const session = driver.session();
    await session.run(
        `   MATCH (n:User {username:$name})-[r:IS_HOUSEWORKER]->(h)
            MATCH (n)-[g:GENDER]->()
            MATCH (n)-[l:LIVES_IN]->() 
            MATCH (h)-[o:OFFERS]->()
            MATCH (h)<-[b:BELONGS_TO]-(c:Comment)<-[cm:COMMENTED]-()
            MATCH (h)<-[ra:RATED]-()
            DELETE ra,b,o,l,g,cm,c,r,h,n`,
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

const getComments = async(username)=>{
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(c:Comment)-[:BELONGS_TO]->(m)
        MATCH(c)<-[:COMMENTED]-(t)
        RETURN ID(c) AS commentID, c.context, t.username`,
    {houseworker:username}
    )
    //{Comment:context, From:'clientUsername'}
    const comments = result.records.map(rec=>{
        let id = rec.get(0);
        let comment_id_integer = id.low + id.high;
        let commentProp = rec.get(1);
        let clientProp = rec.get(2);
        return {commentID:comment_id_integer, comment:commentProp, from:clientProp}
    }) 
    session.close();
    return comments;
    //Example - 2 comments
    //records[0] records[1]
    //get(0)c, get(1)t NODE For each Records
}

const getCommentsCount = async(username) =>{
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
        MATCH(h)<-[b:BELONGS_TO]-(c:Comment)
        RETURN COUNT(c)
        `,
    {houseworker:username}
    )
    //{Comment:context, From:'clientUsername'}
    const commentsCount = result.records[0].get(0);

    session.close();
    return parseInt(commentsCount);
}

const getProfessions_reqSession = async ()=>{
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

const getProfessions = async (username)=>{
    //Get Professions with working Hours
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(m)-[r:OFFERS]->(p)
        return p.title,r.working_hour`,
        {houseworker:username}
    )
    const professions = result.records.map(rec =>{
        //title ='Dadilja" npr (rec.get(0) is WHOLE NODE and has the properties, while rec.get(1) ->r.working_hour is returned property)
        return {profession:rec.get(0) , working_hour:rec.get(1)}
    })
    session.close();
    return professions;
}

const addProfession = async(username,profession, working_hour)=>{
    //const ourUsername ="Sara";
    //MERGE INSTEAD CREATE(m)-[r:OFFERS]->(p)
    //PREVENT TO CREATE MULTIPLE TIMES SAME 'OFFER' RELATIONSHIP
    //(If there is the Offers relationship it will be returned not created )
    const session = driver.session();
    console.log("USERNAME: " + username);
    console.log("PROFESSION: " + profession);
    console.log("WORKING_H " + working_hour);
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(p:Profession {title:$profession})
        MERGE(m)-[r:OFFERS {working_hour:$hour}]->(p)
        RETURN p.title, p.working_hour`,
    {houseworker:username, profession:profession, hour:working_hour}
    )

    //title of added profession
    // return result.records[0].get(0).properties.title;
    //or RETURN p.title
    session.close();
    // return {profession:records[0].get(0), working_hour:records[0].get(1)}
}

const updateWorkingHour = async(username, profession, working_hour)=>{
    const session = driver.session();
    console.log("USERNAME: " + username);
    console.log("PROFESSION: " + profession);
    console.log("WORKING_H " + working_hour);
    const result = await session.run(`
        MATCH (n:User {username: $houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH (p:Profession {title: $profession})
        MATCH (m)-[r:OFFERS]->(p)
        SET r.working_hour = $hour
        RETURN p.title, r.working_hour`,
    {houseworker:username, profession:profession, hour:working_hour}
    )

    session.close()
    return {profession:result.records[0].get(0) , working_hour:result.records[0].get(1)}

    //title of added profession
    // return result.records[0].get(0).properties.title;
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

    //IN User Node
    //username:"Sara", 
    //     email:"sara@gmail.com", 
    //     password:"pw1", 
    //     first_name:"Sara",
    //     last_name:"Veckov",
    //     picture:"/",
    //     age:''

    //RELATIONSHIPS WITH USER NODE
    //     city 
    //     gender

    //IN HOUSEWORKER NODE
    //     address:"Mokranjceva",
    //     description:"Ambicious, Hardworker",
    //     phone_number



    console.log("TSWWWWWW1")
    const {id, username, email, password, first_name, last_name, picturePath, address, description, city, gender, age, phone_number,professions } = houseworkerObject;
    
    console.log("TSWWWWWW2")
    //WITH Clause is necessary between Create and Other part of query(Create Gender and City)
    const result = await session.run(`
        CREATE (n:User 
            {
                id:$id,
                username:$username, 
                email:$email, 
                password:$password, 
                first_name:$first_name,
                last_name:$last_name,
                picturePath:$picturePath
            }
            ) 
            -[:IS_HOUSEWORKER]->
            (
            m:HouseWorker
            {
                username:$username,
                address:$address,
                description:$description,
                phone_number:$phone_number,
                age:$age
            })
        WITH n as user , m as houseworker
        Match(g:Gender {type:$gender})
        MERGE(user)-[r:GENDER]->(g)

        MERGE(c:City {name:$city})
        MERGE(user)-[h:LIVES_IN]->(c)
        RETURN user,g.type,c.name
    `
    ,{id:id ,username:username, email:email, password:password, first_name:first_name, last_name:last_name, picturePath:picturePath, address:address, description:description ,city:city, gender:gender, age:age, phone_number:phone_number}
    )

    console.log("TSWWWWWW3")
    //add Professions to user
    //convert string to array (professions)
    const professionsArray = professions.split(',');
    console.log("PROFESSIONS: " + professions);
    console.log("PROFESSIONSArray: " + JSON.stringify(professionsArray));
    console.log("PROF: TYPEOF: " + typeof(professions));
    console.log("PROF: TYPEOF ARRRAY: " + typeof(professionsArray));
    //add professions
    professionsArray.forEach(profession => {
        console.log("PT: " + profession); 
        addProfession(username, profession, "300");
    });

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
const update = async(username, newUserValue, newHouseworkerValue,)=>{

    //take only properties of User Node
    

    //other properties for HouseworkerNode and RelationSHips(like city and professions)

    //Update UserNode 
    const session = driver.session(); 
    const result = await session.run(`
        MATCH (n:User { username: $houseworker})
        SET n += $object
        RETURN n
    `,{houseworker:username, object:newUserValue}
    )

    const houseworkerResult = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
        SET h += $object
        RETURN h
    `,{houseworker:username, object:newHouseworkerValue}
    )

    session.close();
    return result.records[0].get(0).properties;
}


const updatePassword = async(password)=>{
    const session = driver.session();
    const ourUsername ="Sara";   
    const hashedPassword = bcrypt.hashSync(password, 12);
    const result = await session.run(`
        Match(n:User {username:$username})
        SET n.password = $password
        RETURN n
    `,{username:ourUsername, password:hashedPassword}
    )

    session.close();
    
    return result.records[0].get(0);
}

const updateCity = async(username,city)=>{
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User{username:$houseworker})
        MATCH(n)-[:LIVES_IN]->(c:City)
        Set c.name = $cityName
        return c.name
    `
    ,{houseworker:username, cityName:city}
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

module.exports ={
    findByUsername,
    findAll,
    getInfo,
    findAllWithFilters,
    findByUsernameAndDelete,
    getGender,
    getAge,
    getRatings,
    getComments,
    getProfessions,
    addProfession,
    updateWorkingHour,
    update,
    updateCity,
    updateGender,
    create,
    findCities,
    updatePassword,
    getCommentsCount

}