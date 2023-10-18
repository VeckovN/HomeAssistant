import axios from 'axios'
import { ThrowErorr } from '../utils/ThrowError';

const BASE_URL = 'http://localhost:5000/api/'


//username is included in the request and taken from session
export const getUserData = async() =>{
    try{
        const result = await axios.get(BASE_URL + `houseworker/info`);
        const houseworkerResult = result.data;
        return houseworkerResult;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHouseworkers = async() =>{
    try{
        const result = await axios.get(BASE_URL + `houseworker`);
        const houseworkerResult = result.data;
        return houseworkerResult;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const updateHouseworker = async(newData) =>{
    try{
        await axios.put( BASE_URL + `houseworker/update/`, newData);
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const updateProfessionWorkingHour = async(profession, working_hour) =>{
    try{
        await axios.put( BASE_URL + `houseworker/professions/update/`, {profession, working_hour});
    }
    catch(err){
        ThrowErorr(err);
    }
}

//user of authenticated user(username taken from  session data)
export const getAuthenticatedUserComments = async() =>{
    try{
        const result = await axios.get(BASE_URL + `houseworker/ourcomments/`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

//get commnets of the user with given username
export const getComments = async(username) =>{
    try{
        const result = await axios.get(BASE_URL + `houseworker/comments/${username}`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const postComment = async(postComment) =>{
    try{
        await axios.post(BASE_URL + `clients/comment`, postComment);
    }catch(err){
        ThrowErorr(err);
    }
    
}

export const rateUser = async(rateObject) =>{
    try{
        await axios.post(BASE_URL + 'clients/rate', rateObject)
        //fetch newRate(new calcuation of avarage rate)
        const result = await axios.get(BASE_URL + `houseworker/rating/${rateObject.houseworker}`)
        const ratingValue = result.data;
    
        return ratingValue;
    }
    catch(err){
        ThrowErorr(err);
    }
}



export const getRating = async(username) =>{
    try{
        const result = await axios.get(BASE_URL + `houseworker/rating/${username}`)
        const ratingValue = result.data;
        // console.log("RATIIIIING :" + ratingValue);
        return ratingValue;
    }
    catch(err){
        ThrowErorr(err);
    }
}

//get all professions of the user(based on session.user ) 
export const getProfessions = async()=>{
    try{
        // const result = await axios.get(BASE_URL + `houseworker/professions/${username}`)
        const result = await axios.get(BASE_URL + `houseworker/professions/`)
        const professionsArray = result.data; 
        return professionsArray;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getProfessionsByUsername = async(username)=>{
    try{
        const result = await axios.get(BASE_URL + `houseworker/professions/${username}`)
        const professionsArray = result.data; 
        return professionsArray;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const addProfession = async(label, working_hour) =>{
    //profession object  
    //professionObject. 
    try{
        const result = await axios.post(BASE_URL +'houseworker/professions/add', {profession:label, working_hour:working_hour});
        return result; //message 'Room sucessfully deleted'
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const deleteProfession = async(profession) =>{
    try{
        // const result = await axios.delete(BASE_URL +'houseworker/professions', {profession:profession});
        //for delete method data should be send as query params
        const result = await axios.delete(BASE_URL +`houseworker/professions/${profession}`);
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}


export const getCommentsCount = async(username) =>{
    try{
        const result = await axios.get(BASE_URL + `houseworker/comments/count/${username}`)
        const count = result.data;
        return count;
    }catch(err){
        ThrowErorr(err);
    }
}

export const getConversationCount = async(userRedisID) =>{
    try{
        const result = await axios.get( BASE_URL + `chat/conversationCount/${userRedisID}`)
        const count = result.data;

        console.log("COUNTTTTT :" +JSON.stringify(result));
        console.log("COUNTTTTT DATA :" +JSON.stringify(result.data));
        console.log("YYYYYYY : " + typeof(count))
        return count;
    }
    catch(err){
        ThrowErorr(err);
    }
}

//get all houseworkers cities
export const getAllCities = async() =>{
    try{
        const result = await axios.get( BASE_URL + `houseworker/cities`);
        const cities = result.data;
        return cities;
    }
    catch(err){
        ThrowErorr(err);
    }
}
//get all professions that exist(provided by houseworkers)
export const getAllProfessions = async() =>{
    try{
        const result = await axios.get(BASE_URL +`houseworker/professions/all`);
        const professionsResult = result.data;
        console.log("RESLSLLSLSL: "  + professionsResult)
        return professionsResult;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHouseworkerByFilter = async(params) =>{
    try{
        const result = await axios.get(BASE_URL + `houseworker/filter?${params}`);
        const houseworkers = result.data;
        return houseworkers;
    }
    catch(err){
        ThrowErorr(err);
    }
}


