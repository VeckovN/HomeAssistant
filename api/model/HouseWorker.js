const {driver} = require('../db/neo4j');
const { set ,get, expire, zadd, zrem, zrangerevscores} = require('../db/redis');
const {getUserIdByUsername, updateUserPicturePath, getUserPicturePath, getNotificationsByOffset, getNotificationsUnreadCount, getNotificationsUnreadTotalCount} = require('../db/redisUtils');
const path = require('path');
const fs = require('fs');

const findByUsername = async (username)=>{
    const session = driver.session();
    try{
        const result = await session.run(
            'MATCH (n:User {username:$name})-[:IS_HOUSEWORKER]->() RETURN n',
            {name:username})
        if(result.records.length == 0){
            return null
        }
        else{
            const singleRecord = result.records[0];
            const node = singleRecord.get(0);
            const client = node.properties;

            return client;
        }
    }
    catch(error){
        console.error("Error finding user :", error.message); 
        throw new Error("Failed to find user. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getInfo = async(username)=>{
    const session = driver.session();
    try{
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

        return houseworkerInfo;
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
    try{
        const result = await session.run(
            'Match(n:User)-[:IS_HOUSEWORKER]->() return n'
        )
        const clients = result.records.map(el=>{
            return el.get(0).properties;
        })

        return clients;
    }
    catch(error){
        console.error("Error finding users :", error.message); 
        throw new Error("Failed to find users. Please try again later.");
    }
    finally{
        session.close();
    }
}

const checkFilterHouseworkerInCache = async (filters)=>{
    const filter = JSON.stringify(filters);
    try{
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
    catch(error){
        console.error("Error checking houseworker cache:", error.message); 
        throw new Error("Failed to check houseworker cache. Please try again later.");
    }
}

//FILTER
const findAllWithFilters = async(filters)=>{
    const session = driver.session();
    const {
        limit = 10,
        itemsPerPage = 4,
        pageNumber,
        sort = 'ASC',
        city,
        gender, 
        ageFrom,
        ageTo,
        professions,  
        name:searchName, 
    } = filters;
        
    try{
        const catchData = await checkFilterHouseworkerInCache(filters);
        if(catchData==null){
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
                if(city!=undefined && city!='')
                    where+=`c.name='${city}' `
        
                if(gender!=undefined && gender!=''){
                    if(where.trim().length > 5)
                        where+=` AND g.type='${gender}'`;
                    else
                        where+=`g.type='${gender}'`;
                }
            }

            //AGE
            if((ageTo!=undefined && ageTo!= '')||( ageFrom!=undefined && ageFrom!= '')){
                if(where.trim().length > 5)
                    where+=` AND h.age >= '${ageFrom}' AND h.age <='${ageTo}' `
                else
                    where+=`h.age > '${ageFrom}' AND h.age < '${ageTo}' `
            }

            //PROFESSIONS
            var professionsLength = 0;
            if(professions){            
                let professionsArray = professions.split(',');
                professionsLength = professionsArray.length;
                if(professionsLength>0)
                {
                    let professionString = '';
                    if(professionsLength ==1)
                        professionString += `"${professions}"`;
                    else{
                        for(let i=0; i<professionsLength; i++){
                            if(i<professionsLength-1) //0,1,2  --- <4-1
                                professionString+= `"${professionsArray[i]}" ,`
                            else    
                                professionString+= `"${professionsArray[i]}" `;
                        }
                    }
                    
                    if(where.trim().length > 5){
                        where+= ` AND p.title IN [${professionString}] `;
                    }
                    else{
                        where+= `p.title IN [${professionString}] `
                    }
                }
            }

            //SEARCH
            if(searchName!=undefined && searchName!= ''){
                if(where.trim().length > 5)
                    where +=`AND toLower(n.username) STARTS WITH toLower('${searchName}') \n`
                else
                    where+=`toLower(n.username) STARTS WITH toLower('${searchName}') \n`
            }
            
            //RATING 
            if(sortFlag){
                if(where.trim().length > 5)
                    where+=' AND r.rating>0 '
                else
                    where+='r.rating>0'

                queryNeo4j+=`MATCH(h)<-[r:RATED]-() \n`
            }

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

            //console.log("QUERY: \n" +  queryNeo4j + "\n");

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
            
            return houseworkers;
        }
        else{
            return catchData;
        }
    }
    catch(error){
        console.error("Error filtering user :", error.message); 
        throw new Error("Failed to filter user. Please try again later.");
    }
    finally{
        session.close();
    }
}

const findByUsernameAndDelete = async (username)=>{
    const session = driver.session();
    try{
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
        return await findAll();
    }
    catch(error){
        console.error("Error deleting user :", error.message); 
        throw new Error("Failed to delete user. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getGender = async(username)=>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
            MATCH(n)-[:GENDER]->(g)
            RETURN g.type
        `,{houseworker:username})

        return result.records[0].get(0);
    }
    catch(error){
        console.error("Error getting user gender :", error.message); 
        throw new Error("Failed to get user gender. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getAge = async(username)=>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
            MATCH(n)-[:LIVES_IN]->(c)
            RETURN c.name
        `,{houseworker:username})
        return result.records[0].get(0);
    }
    catch(error){
        console.error("Error getting user age :", error.message); 
        throw new Error("Failed to get user age. Please try again later.");
    }
    finally{
        session.close();
    }   
}

const findCities = async()=>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH(n:User)-[:IS_HOUSEWORKER]->(h)
            MATCH(n)-[:LIVES_IN]->(c:City)
            RETURN DISTINCT c.name
        `)
        const cities = result.records.map(el =>{
            return el.get(0);
        })

        return cities;
    }
    catch(error){
        console.error("Error finding user cities :", error.message); 
        throw new Error("Failed to find user cities. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getRatings = async(username)=>{
    const session = driver.session();
    try{
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
            return parseInt(0); //strict Int value (not Boolean)
        }

        if(ratings.length >=2){
            avgSum = ratings.reduce((rat1, rat2) => parseInt(rat1) + parseInt(rat2));  //0 start acc
            avgRating = avgSum / ratings.length;
        }
        else{
            return parseInt(ratings)
        }

        return avgRating;
    }
    catch(error){
        console.error("Error geting user rating :", error.message); 
        throw new Error("Failed to user rating. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getComments = async(username, pageNumber)=>{
    //on inital (page visit) thepageNUmber is 0 
    const itemsPerPage = 10;
    var skipCount = pageNumber * itemsPerPage;

    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
            MATCH(c:Comment)-[:BELONGS_TO]->(m)
            MATCH(c)<-[:COMMENTED]-(t)
            RETURN ID(c) AS commentID, c.context, t.username, c.read, apoc.date.format(c.timestamp, "ms", "dd.MM.yyyy") AS commentTimestamp
            ORDER BY c.timestamp DESC 
            SKIP ${skipCount} LIMIT ${itemsPerPage}`,
        {houseworker:username}
        )

        const comments = result.records.map(rec=>{
            let id = rec.get(0);
            let comment_id_integer = id.low + id.high;
            let commentProp = rec.get(1);
            let clientProp = rec.get(2);
            let commentRead = rec.get(3)
            let commentDate = rec.get(4);
            return {commentID:comment_id_integer, comment:commentProp, from:clientProp, read:commentRead, date:commentDate}
        }) 

        return comments;
    }
    catch(error){
        console.error("Error getting comments :", error.message); 
        throw new Error("Failed to get comments. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getCommentsCount = async(username) =>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
            MATCH(h)<-[b:BELONGS_TO]-(c:Comment)
            RETURN COUNT(c)
            `,
        {houseworker:username}
        )
        const commentsCount = result.records[0].get(0);

        return parseInt(commentsCount);
    }
    catch(error){
        console.error("Error getting comments count :", error.message); 
        throw new Error("Failed to get comment count. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getUnreadComments = async(username) =>{
    const session = driver.session();
    try{
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

        return comments;
    }
    catch(error){
        console.error("Error getting unread comments :", error.message); 
        throw new Error("Failed to get unread comments. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getUnreadCommentsCount = async(username) =>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
            MATCH(h)<-[b:BELONGS_TO]-(c:Comment)
            WHERE c.read = false
            RETURN COUNT(c)
            `,
        {houseworker:username}
        )
        const commentsCount = result.records[0].get(0);
        return parseInt(commentsCount);
    }
    catch(error){
        console.error("Error getting unread comments count :", error.message); 
        throw new Error("Failed to get unread comments count. Please try again later.");
    }
    finally{
        session.close();
    }
}

const markAllCommentsAsRead = async(username) =>{
    const session = driver.session();
    try{
        await session.run(`
            MATCH (n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
            WITH h
            MATCH (h)<-[b:BELONGS_TO]-(c:Comment)
            WHERE c.read = false
            SET c.read = true
            RETURN c
        `,
        {houseworker:username});
        return true;
    }
    catch(error){
        console.error("Error marking comments :", error.message); 
        throw new Error("Failed to mark unread comments. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getProfessions = async (username)=>{

    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
            MATCH(m)-[r:OFFERS]->(p)
            return p.title,r.working_hour`,
            {houseworker:username}
        )
        const professions = result.records.map(rec =>{
            return {profession:rec.get(0) , working_hour:rec.get(1)}
        })

        return professions;
    }
    catch(error){
        console.error("Error getting professions  :", error.message); 
        throw new Error("Failed to get professions. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getAllProffesions = async() =>{
    const session = driver.session();
    try{
        const result = await session.run(`
                MATCH(n:Profession)
                return n.title, n.description
            `)
        const professions = result.records.map(rec =>{
            return {title: rec.get(0), description: rec.get(1)}
        })

        return professions;
    }
    catch(error){
        console.error("Error getting all professions count :", error.message); 
        throw new Error("Failed to get all professions. Please try again later.");
    }
    finally{
        session.close();
    }
}
 
const addProfession = async(username,profession, working_hour)=>{
    const session = driver.session();
    try{
        await session.run(`
            MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
            MATCH(p:Profession {title:$profession})
            MERGE(m)-[r:OFFERS {working_hour:$hour}]->(p)
            RETURN p.title, p.working_hour`,
        {houseworker:username, profession:profession, hour:working_hour}
        )
    }
    catch(error){
        console.error("Error adding profession count :", error.message); 
        throw new Error("Failed to get add profession count. Please try again later.");
    }
    finally{
        session.close();
    }
}
const deleteProfession = async(username,profession)=>{
    const session = driver.session();
    try{  
        const result = await session.run(`
            MATCH(n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(m)
            MATCH(m)-[r:OFFERS]->(p:Profession{title:$profession})
            DELETE r
            WITH m
            MATCH(m)-[remainingR:OFFERS]->(remainingP:Profession)
            RETURN remainingP.title, remainingR.working_hour`, //all remained professions are returned
        {houseworker:username, profession:profession}
        )

        return result;
    }
    catch(error){
        console.error("Error deleting profession count :", error.message); 
        throw new Error("Failed to get delete profession. Please try again later.");
    }
    finally{
        session.close();
    }
}

const updateWorkingHour = async(username, profession, working_hour)=>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH (n:User {username: $houseworker})-[:IS_HOUSEWORKER]->(m)
            MATCH (p:Profession {title: $profession})
            MATCH (m)-[r:OFFERS]->(p)
            SET r.working_hour = $hour
            RETURN p.title, r.working_hour`,
        {houseworker:username, profession:profession, hour:working_hour}
        )

        return {profession:result.records[0].get(0) , working_hour:result.records[0].get(1)}
    }
    catch(error){
        console.error("Error updating user working hour:", error.message); 
        throw new Error("Failed to update user working hour. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getHouseworkersCount = async() =>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH (n:User)-[:IS_HOUSEWORKER]->(h)
            RETURN count(h)`
        )
        const count = parseInt(result.records[0].get(0));
        return {count:count}
    }
    catch(error){
        console.error("Error getting houseworker count:", error.message); 
        throw new Error("Failed to get houseworker count. Please try again later.");
    }
    finally{
        session.close();
    }

}

const create = async(houseworkerObject)=>{
    const session = driver.session();
    const {id, username, email, password, firstName, lastName, picturePath, address, description, city, gender, age, phoneNumber,professions, houseworkerProfessions} = houseworkerObject;

    try{
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

const update = async(username, newUserValue, newHouseworkerValue)=>{
    const session = driver.session(); 
    try{
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

        return result.records[0].get(0).properties;
    }
    catch(error){
        console.error("Error updating user:", error.message); 
        throw new Error("Failed to update user. Please try again later.");
    }
    finally{
        session.close();
    }
}
 
const updateCity = async(username,city)=>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH(n:User{username:$houseworker})
            MATCH(n)-[:LIVES_IN]->(c:City)
            Set c.name = $cityName
            return c.name
        `
        ,{houseworker:username, cityName:city}
        )
        
        return result.records[0].get(0);
    }
    catch(error){
        console.error("Error updating user city:", error.message); 
        throw new Error("Failed to update user city. Please try again later.");
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
            MATCH(n:User{username:$houseworker})
            MATCH(n)-[:GENDER]->(g:Gender)
            Set g.type = $gender
            return g.type
        `
        ,{houseworker:ourUsername, gender:gender}
        )

        return result.records[0].get(0);
    }
    catch(error){
        console.error("Error updating user gender:", error.message); 
        throw new Error("Failed to update user gender. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getHomeInfo = async(username) =>{
    const session = driver.session();
    //OPTIONAL MATCH because not all houseworkers may have comments, 
    //and we want to count them if they exist.
    try{
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

        const professions = result.records[0].get(0);
        const commentCount = parseInt(result.records[0].get(1));
        const avgRating = parseInt(result.records[0].get(2));

        return {professions, commentCount, avgRating};
    }
    catch(error){
        console.error("Error getting user home info:", error.message); 
        throw new Error("Failed to get user home info. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getProfessionsAndRating = async(username) =>{
    const session = driver.session();
    try{
        const result = await session.run(`
            MATCH (n:User {username:$houseworker})-[:IS_HOUSEWORKER]->(h)
            MATCH (h)-[o:OFFERS]->(p:Profession)
            OPTIONAL MATCH (h)<-[r:RATED]-()
            WITH p.title AS title, o.working_hour AS workingHour, AVG(r.rating) AS avgRating
            RETURN COLLECT({title: title, workingHour: workingHour}) AS professions, avgRating`,
            {houseworker:username}
        )
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
    catch(error){
        console.error("Error getting professions and rating:", error.message); 
        throw new Error("Failed to get professions and rating. Please try again later.");
    }
    finally{
        session.close();
    }
}

const getRecordedNotifications = async(username, offset, size) =>{
    try{
        const userID = await getUserIdByUsername(username);

        //on initial get first 5 or 6 notifications based on offset and size,
        const notifications = await getNotificationsByOffset(userID, offset, size-1);
        const unreadCount = await getNotificationsUnreadCount(userID);
        const totalCount = await getNotificationsUnreadTotalCount(userID);
        return {notifications, unreadCount, totalCount};
    }
    catch(error){
        console.error("Error getting recorded notifications :", error.message); 
        throw new Error("Failed to get recorded notifications. Please try again later.");
    }
}

const getMoreRecordedNotifications = async(username, batchNumber) =>{
    try{
        const userID = await getUserIdByUsername(username);
        const size = 6;
        const offset = size * batchNumber;
        const endIndex = offset + size -1; 

        const notifications = await getNotificationsByOffset(userID, offset, endIndex);
        return notifications;
    }
    catch(error){
        console.error("Error getting more recorded notifications:", error.message); 
        throw new Error("Failed to get more recorded notifications. Please try again later.");
    }
}

const markNotificationAsRead = async(userID, notificationID, batchNumber) =>{
    try{
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
    catch(error){
        console.error("Error marking notifications as read:", error.message); 
        throw new Error("Failed to mark notifications. Please try again later.");
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
    markNotificationAsRead
}