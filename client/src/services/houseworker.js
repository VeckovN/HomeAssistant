import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api/'


//username is included in the request and taken from session
export const getUserData = async() =>{
    try{
        const result = await axios.get(`http://localhost:5000/api/houseworker/info`);
        const houseworkerResult = result.data;
        return houseworkerResult;
    }
    catch(err){
        console.log(err)
    }
}

export const updateHouseworker = async(newData) =>{
    const result = await axios.put( BASE_URL + `/houseworker/update/`, newData);
    const user = result.data;
    return user;
}

//user of authenticated user(username taken from  session data)
export const getAuthenticatedUserComments = async() =>{
    try{
        const result = await axios.get(BASE_URL + `/houseworker/ourcomments/`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        console.log(err);
    }
}

//get commnets of the user with given username
export const getComments = async(username) =>{
    try{
        const result = await axios.get(BASE_URL + `/houseworker/comments/${username}`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        console.log(err);
    }
}

export const postComment = async(postComment) =>{
    await axios.post(BASE_URL + `/clients/comment`, postComment);
}

export const rateUser = async(rateObject) =>{
    await axios.post(BASE_URL + '/api/clients/rate', rateObject)
}



export const getRating = async(username) =>{
    try{
        const result = await axios.get(BASE_URL + `/houseworker/rating/${username}`)
        const ratingValue = result.data;
        return ratingValue;
    }
    catch(err){
        console.log(err);
    }
}

//get all professions of the user with the given username
export const getProfessions = async(username)=>{
    try{
        const result = await axios.get(BASE_URL + `/houseworker/professions/${username}`)
        const professionsArray = result.data; //[{profession, rec.get(1)}]
        return professionsArray;
    }
    catch(err){
        console.log(err)
    }
}


export const getCommentsCount = async(username) =>{
    try{
        const result = await axios.get(BASE_URL + `/houseworker/comments/count/${username}`)
        const count = result.data;
        return count;
    }catch(err){
        console.log(err);
    }
}

export const getConversationCount = async(userRedisID) =>{
    try{
        const result = await axios.get( BASE_URL + `/chat/conversationCount/${userRedisID}`)
        const count = result.data;
        return count;
    }
    catch(err){
        console.log(err);
    }
}

//get all houseworkers cities
export const getAllCities = async() =>{
    try{
        const result = await axios.get( BASE_URL + `/houseworker/cities`);
        const cities = result.data;
        return cities;
    }
    catch(err){
        console.log(err)
    }
}
//get all professions that exist(provided by houseworkers)
export const getAllProfessions = async() =>{
    try{
        const result = await axios.get(BASE_URL +`/houseworker/professions`);
        const professionsResult = result.data;
        return professionsResult;
    }
    catch(err){
        console.log(err)
    }
}

export const s = async() =>{
    try{

    }
    catch(err){
        console.log(err)
    }
}

