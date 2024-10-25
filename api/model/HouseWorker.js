const {driver} = require('../db/neo4j');
const { set ,get, expire, zadd, zrem, zrangescores, zrangerevscores} = require('../db/redis');
const {getUserIdByUsername, updateUserPicturePath, getUserPicturePath, getNotificationsByOffset, getNotificationsUnreadCount} = require('../db/redisUtils');
const path = require('path');
const fs = require('fs');

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

    houseworkerInfo.address = houseworkerProp.address;
    houseworkerInfo.phone_number = houseworkerProp.phone_number;
    houseworkerInfo.description = houseworkerProp.description;
    
    houseworkerInfo.gender = houseworkerGender;
    houseworkerInfo.city = houseworkerCity;

    session.close();
    return houseworkerInfo;
}

const findAll = async ()=>{
    const session = driver.session();
    const result = await session.run(
        'Match(n:User)-[:IS_HOUSEWORKER]->() return n'
    )
    const clients = result.records.map(el=>{
        return el.get(0).properties;
    })
    session.close();
    return clients;
}

const checkFilterHouseworkerInCache = async (filters)=>{
    const filter = JSON.stringify(filters);
    
    console.log("FILTERS: " + filter);
    //fillter will be key in REDIS DB
    const data = await get(filter); //this is clasic string -> that is ok structure for this
    //becasue we store houseworkers as JSON()

    if(data){
        //cache hit
        const dataObj = JSON.parse(data);
        return dataObj
    }
    else{
        //no houseworker with filters in DB
        return null;
    }
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
        itemsPerPage = 4,
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

        //WHERE PART
        if((city!=undefined && city!='') && (gender!=undefined && city!='')){
            where+=`c.name='${city}' AND g.type='${gender}'`
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

        //Professions
        var professionsLength = 0;
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
                else{
                    where+= `p.title IN [${professionString}] `
                    console.log("TEST2");
                }
            }
            
        }

        if(searchName!=undefined && searchName!= ''){
            if(where.trim().length > 5)
                where +=`AND toLower(n.username) STARTS WITH toLower('${searchName}') \n`
            else
                where+=`toLower(n.username) STARTS WITH toLower('${searchName}') \n`
        }
                
        if(sortFlag){
            if(where.trim().length > 5)
                where+=' AND r.rating>0 '
            else
                where+='r.rating>0'

            queryNeo4j+=`MATCH(h)<-[r:RATED]-() \n`
        }
        
        //ADDING WHERE PART TO QUERY
        if((city!=undefined && city!='' )||( gender!=undefined && gender!='' )|| (ageTo!=undefined && ageTo!= '') || (ageFrom!=undefined && ageFrom!= '')||( searchName!=undefined && searchName!='') || sortFlag || professionsLength>0)
            queryNeo4j+=where

        //ORDER By part
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
        queryNeo4j+=orderBy;
        queryNeo4j+=returnQ;

        // //Infinity Scroll (SKIP AND LIMIT clausules)
        queryNeo4j+=`SKIP ${skipCount} \n`
        queryNeo4j+=`LIMIT ${itemsPerPage}`

        console.log("QUERY: \n" +  queryNeo4j + "\n");

        const result = await session.run(queryNeo4j);
        const houseworkers = result.records.map(el =>{
            let userInfo = {};
            const userNode = el.get(0).properties;
            const housworkerNode = el.get(1).properties;
            userInfo ={...userNode, ...housworkerNode}
            userInfo.city = el.get(2);
            userInfo.gender =el.get(3); 

            return userInfo;
        })

        // //STORE(CATCH) FILTERED HOYUSEWORKER IN REDIS 
        await set(JSON.stringify(filters), JSON.stringify(houseworkers))
        await expire(JSON.stringify(filters), 10*60); //TTL 10 min
        
        session.close();
        return houseworkers;
    }
    else{
        console.log("\n CATCH EXISSSSSSST \n");
        return catchData;
    }
}

const findByUsernameAndDelete = async (username)=>{
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

const getRatings = async(username)=>{
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(m)<-[r:RATED]-() return r.rating`,
        {houseworker:username}
    )

    const ratings = result.records.map(rec =>{
        return rec.get(0);
    })

    var avgRating =0;
    var avgSum;
    if(ratings.length==0){
        session.close();
        return parseInt(0); //strict Int value (not Boolean)
    }

    if(ratings.length >=2){
        avgSum = ratings.reduce((rat1, rat2) => parseInt(rat1) + parseInt(rat2));  //0 start acc
        avgRating = avgSum / ratings.length;
    }
    else{
        session.close();
        return parseInt(ratings)
    }

    session.close();
    return avgRating;
}

// const getComments = async(username)=>{
const getComments = async(username, pageNumber)=>{
    //on inital (page visit) thepageNUmber is 0 ->start fetching the comments from start
    const itemsPerPage = 10;
    var skipCount = pageNumber * itemsPerPage;

    //read comments
    //change comment.read to true

    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(c:Comment)-[:BELONGS_TO]->(m)
        MATCH(c)<-[:COMMENTED]-(t)
        RETURN ID(c) AS commentID, c.context, t.username, c.read, apoc.date.format(c.timestamp, "ms", "dd.MM.yyyy") AS commentTimestamp
        ORDER BY c.timestamp DESC 
        SKIP ${skipCount} LIMIT ${itemsPerPage}`,
    {houseworker:username}
    )
    //{Comment:context, From:'clientUsername'}
    const comments = result.records.map(rec=>{
        let id = rec.get(0);
        let comment_id_integer = id.low + id.high;
        let commentProp = rec.get(1);
        let clientProp = rec.get(2);
        let commentRead = rec.get(3)
        let commentDate = rec.get(4);
        return {commentID:comment_id_integer, comment:commentProp, from:clientProp, read:commentRead, date:commentDate}
    }) 
    session.close();

    return comments;
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

const getUnreadComments = async(username) =>{
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(c:Comment)-[:BELONGS_TO]->(m)
        MATCH(c)<-[:COMMENTED]-(t)
        WHERE c.read = false
        RETURN ID(c) AS commentID, c.context, t.username, apoc.date.format(c.timestamp, "ms", "dd.MM.yyyy") AS commentTimestamp
        ORDER BY c.timestamp DESC`,
    {houseworker:username}
    )
    const comments = result.records.map(rec=>{
        let id = rec.get(0);
        let comment_id_integer = id.low + id.high;
        let commentProp = rec.get(1);
        let clientProp = rec.get(2);
        let commentDate = rec.get(3);
        return {commentID:comment_id_integer, comment:commentProp, from:clientProp, date:commentDate}
    }) 
    session.close();

    return comments;
}

const getUnreadCommentsCount = async(username) =>{
    const session = driver.session();
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
        MATCH(h)<-[b:BELONGS_TO]-(c:Comment)
        WHERE c.read = false
        RETURN COUNT(c)
        `,
    {houseworker:username}
    )
    //{Comment:context, From:'clientUsername'}
    const commentsCount = result.records[0].get(0);

    session.close();
    return parseInt(commentsCount);
}


const markAllCommentsAsRead = async(username) =>{
    const session = driver.session();
    await session.run(`
        MATCH (n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
        WITH h
        MATCH (h)<-[b:BELONGS_TO]-(c:Comment)
        WHERE c.read = false
        SET c.read = true
        RETURN c
      `,
      {houseworker:username});

    session.close();
    return true;
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

const getAllProffesions = async() =>{
    const session = driver.session();
    const result = await session.run(`
            MATCH(n:Profession)
            return n.title, n.description
        `)
    const professions = result.records.map(rec =>{
        return {title: rec.get(0), description: rec.get(1)}
    })

    console.log("PROFESSIONS 55555 : " + professions);

    session.close();
    return professions;
}
 
const addProfession = async(username,profession, working_hour)=>{
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
    session.close();
}
const deleteProfession = async(username,profession)=>{
    const session = driver.session();
    console.log("USERNAME: " + username);
    console.log("PROFESSION: " + profession);
    const result = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
        MATCH(m)-[r:OFFERS]->(p:Profession{title:$profession})
        DELETE r
        WITH m
        MATCH(m)-[remainingR:OFFERS]->(remainingP:Profession)
        RETURN remainingP.title, remainingR.working_hour`, //all remained professions are returned
    {houseworker:username, profession:profession}
    )
    session.close();
    return result;
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
}

const getHouseworkersCount = async() =>{
    const session = driver.session();
    const result = await session.run(`
        MATCH (n:User)-[:IS_HOUSEWORKER]->(h)
        RETURN count(h)`
    )
    const count = parseInt(result.records[0].get(0));
    session.close()
    return {count:count}
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

    const {id, username, email, password, firstName, lastName, picturePath, address, description, city, gender, age, phoneNumber,professions, houseworkerProfessions} = houseworkerObject;
    console.log("TSWWWWWW2")
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
            -[:IS_HOUSEWORKER]->
            (
            m:HouseWorker
            {
                username:$username,
                address:$address,
                description:$description,
                phone_number:$phoneNumber,
                age:$age
            })
        WITH n as user , m as houseworker
        Match(g:Gender {type:$gender})
        MERGE(user)-[r:GENDER]->(g)

        MERGE(c:City {name:$city})
        MERGE(user)-[h:LIVES_IN]->(c)
        RETURN user,g.type,c.name
    `
    ,{id:id ,username:username, email:email, password:password, firstName:firstName, lastName:lastName, picturePath:picturePath, address:address, description:description ,city:city, gender:gender, age:age, phoneNumber:phoneNumber}
    )

    const professionsArray = JSON.parse(houseworkerProfessions);
    professionsArray.forEach(profession =>{
        console.log("PROF: " + profession.label + " Working_hour: " + profession.working_hour + '\n');
        addProfession(username, profession.label, profession.working_hour)
    })

    const user = result.records[0].get(0).properties;
    const userGender = result.records[0].get(1);
    const userCity = result.records[0].get(2);

    session.close();
    return {
        user, gender:userGender, city:userCity
    }
}

const update = async(username, newUserValue, newHouseworkerValue)=>{
    const session = driver.session(); 
    const result = await session.run(`
        MATCH (n:User { username: $houseworker})
        SET n += $object
        RETURN n
    `,{houseworker:username, object:newUserValue}
    )

    //check does picturePath is changing
    if(newUserValue.picturePath){

        const oldImageFileName = await getUserPicturePath(username);
        const oldImagePath = path.join(__dirname, '../../../client/public/assets/userImages', oldImageFileName);
        fs.unlink(oldImagePath, (err) =>{
            if(err){
                console.log("Faield to delete old imgage: ", err);
            }
        })

        await updateUserPicturePath(username, newUserValue.picturePath);
    }

    const houseworkerResult = await session.run(`
        MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
        SET h += $object
        RETURN h
    `,{houseworker:username, object:newHouseworkerValue}
    )

    session.close();
    return result.records[0].get(0).properties;
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


const getHomeInfo = async(username) =>{
    const session = driver.session();
    //OPTIONAL MATCH because not all houseworkers may have comments, 
    //and we want to count them if they exist.
    const result = await session.run(`
        MATCH (n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
        OPTIONAL MATCH (h)<-[:BELONGS_TO]-(c:Comment)
        WITH n, h, COUNT(DISTINCT c) AS commentCount
        MATCH (h)-[:OFFERS]->(p:Profession)
        MATCH (n)-[:IS_HOUSEWORKER]->(m)
        OPTIONAL MATCH (m)<-[r:RATED]-()
        WITH p.title AS profs, commentCount, AVG(r.rating) AS avgRating
        RETURN COLLECT(profs) AS professions, commentCount, avgRating`,
        {houseworker:username}
    )

    session.close();

    const professions = result.records[0].get(0);
    const commentCount = parseInt(result.records[0].get(1));
    const avgRating = parseInt(result.records[0].get(2));

    return {professions, commentCount, avgRating};
}


const getProfessionsAndRating = async(username) =>{
    const session = driver.session();
    //OPTIONAL MATCH because not all houseworkers may have comments, 
    //and we want to count them if they exist.
    const result = await session.run(`
        MATCH (n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
        MATCH (h)-[o:OFFERS]->(p:Profession)
        OPTIONAL MATCH (h)<-[r:RATED]-()
        WITH p.title AS title, o.working_hour AS workingHour, AVG(r.rating) AS avgRating
        RETURN COLLECT({title: title, workingHour: workingHour}) AS professions, avgRating`,
        {houseworker:username}
    )
    session.close();

    // const professions = result.records[0].get(0).map(rec =>{
    const professions = result.records[0].get('professions').map(rec =>{
        return {profession:rec.title , working_hour:rec.workingHour}
    })
    //or result.records[0].get("avgRating")
    let avgRating = result.records[0].get(1);
    if(avgRating == null)
        avgRating = 0;
        
    return {professions:professions, avgRating:avgRating}
}


//redis usage

//get message From ---  ZREVRANGE room:{roomID} {offset_start} {offset_end}
// ZREVRANGE room:1:2 0 50 (will return 50 messages with 0 offsets for the private room between users with IDs 1 and 2.)
const getRecordedNotifications = async(username, offset, size) =>{
    const userID = await getUserIdByUsername(username);

    //on initial get first 5 or 6 notifications based on offset and size,
    const notifications = await getNotificationsByOffset(userID, offset, size-1);
    const unreadCount = await getNotificationsUnreadCount(userID);
    return {notifications, unreadCount};
}

// const getMoreRecordedNotifications = async(userID, pageNumber) =>{
const getMoreRecordedNotifications = async(username, batchNumber) =>{
    const userID = await getUserIdByUsername(username);
    const size = 6;
    const offset = size * batchNumber;
    const endIndex = offset + size -1; 
    
    const notifications = await getNotificationsByOffset(userID, offset, endIndex);
    return notifications;
}

const markAllNotificationsAsRead = async(username) =>{ 
    const userID = await getUserIdByUsername(username);
    const notifications = await zrangescores(`user:${userID}:notifications`, 0, -1); // -1 ->last element
    //WITHSCORE -> [0] -objectData ,[1] - SCORE VALUE, [2] - next obj, [3] -SCORE VALUE 
    // that means +2 for new set data
    for(let i = 0; i< notifications.length; i +=2){
        const notificationStr = notifications[i];
        const score = notifications[i+1];

        const notificationObj = JSON.parse(notificationStr);

        if(notificationObj.read === false){
            notificationObj.read = true;
        }

        //overwrite the notification in the sorted set with the same score  
        await zadd(`user:${userID}:notifications`, score, JSON.stringify(notificationObj));
    }
    // return true;
}

const markNotificationAsRead = async(userID, notificationID, batchNumber) =>{
    //optimized : search only for displayed users
    const size = 6;
    const offset = size * batchNumber + 1;
    const endIndex = offset + size -1; 

    const notifications = await zrangerevscores(`user:${userID}:notifications`, 0, endIndex); // -1 ->last element
    for(let i = 0; i< notifications.length; i +=2){
        const notificationStr = notifications[i];
        const score = notifications[i+1];

        const notificationObj = JSON.parse(notificationStr);

        if(notificationObj.id == notificationID){
            if(notificationObj.read == false){
                notificationObj.read = true;
                await zrem(`user:${userID}:notifications`, notificationStr);
                await zadd(`user:${userID}:notifications`, score, JSON.stringify(notificationObj));
            }
        }
    }
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
    getUnreadComments,
    getUnreadCommentsCount,
    markAllCommentsAsRead,
    getProfessions,
    getAllProffesions,
    addProfession,
    deleteProfession,
    updateWorkingHour,
    update,
    updateCity,
    updateGender,
    create,
    findCities,
    getCommentsCount,
    getHomeInfo,
    getProfessionsAndRating,
    getHouseworkersCount,
    getRecordedNotifications,
    getMoreRecordedNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead
}