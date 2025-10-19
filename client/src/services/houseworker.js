import axios from 'axios'
import { ThrowErorr } from '../utils/ErrorUtils';
import { baseAxios, authenticatedAxios } from '../utils/AxiosConfig';

export const getUserData = async() =>{
    try{
        const result = await authenticatedAxios.get(`/houseworker/info`);
        const houseworkerResult = result.data;
        return houseworkerResult;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHouseworkers = async() =>{
    try{
        const result = await baseAxios.get(`/houseworker`);
        const houseworkerResult = result.data;
        return houseworkerResult;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHouseworkersCount = async() =>{
    try{
        const result = await authenticatedAxios.get(`/houseworker/count`)
        const count = result.data;
        return count;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const updateHouseworker = async(formData) =>{
    try{
         await authenticatedAxios.put(`/houseworker/update/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const updateProfessionWorkingHour = async(profession, working_hour) =>{
    try{
        await authenticatedAxios.put(`/houseworker/professions/update/`, {profession, working_hour});
    }
    catch(err){
        ThrowErorr(err);
    }
}

//user of authenticated user(username taken from session data)
export const getAuthenticatedUserComments = async(pageNumber) =>{
    try{
        const result = await authenticatedAxios.get(`/houseworker/ourcomments/${pageNumber}`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getComments = async(username, pageNumber) =>{
    try{
        const result = await authenticatedAxios.get(`/houseworker/comments/${username}/${pageNumber}`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getUnreadComments = async(username) =>{
    try{
        const result = await authenticatedAxios.get(`/houseworker/comments/unread/${username}`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const markUnreadComments = async(username) =>{
    try{
        const result = await authenticatedAxios.get(`/houseworker/comments/unread/mark/${username}`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const postComment = async(newComment) =>{
    try{
        const result = await authenticatedAxios.post(`/clients/comment`, newComment);
        const commentResult = result.data;
        return commentResult;
    }catch(err){
        ThrowErorr(err);
    }
}

export const rateUser = async(rateObject) =>{
    try{
        const postResult = await authenticatedAxios.post('/clients/rate', rateObject)
        const postResultData = postResult.data;
        //fetch newRate(new calcuation of avarage rate)
        const result = await baseAxios.get(`/houseworker/rating/${rateObject.houseworker}`)
        const newAvgRate = result.data;
        
        // rate:rateValue, notification:notification  - postResult
        return  {...postResultData, newAvgRate:newAvgRate};
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getRating = async(username) =>{
    try{
        const result = await baseAxios.get(`/houseworker/rating/${username}`)
        const ratingValue = result.data;
        return ratingValue;
    }
    catch(err){
        ThrowErorr(err);
    }
}


//get all professions of the user(based on session.user ) 
export const getProfessions = async()=>{
    try{
        const result = await baseAxios.get(`/houseworker/professions/`)
        const professionsArray = result.data; 
        return professionsArray;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getProfessionsByUsername = async(username)=>{
    try{
        const result = await baseAxios.get(`/houseworker/professions/${username}`)
        const professionsArray = result.data; 
        return professionsArray;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const addProfession = async(label, working_hour) =>{
    try{
        const result = await baseAxios.post('/houseworker/professions/add', {profession:label, working_hour:working_hour});
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const deleteProfession = async(profession) =>{
    try{
        const result = await baseAxios.delete(`/houseworker/professions/${profession}`);
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getCommentsCount = async(username) =>{
    try{
        const result = await baseAxios.get(`/houseworker/comments/count/${username}`)
        const count = result.data;
        return count;
    }catch(err){
        ThrowErorr(err);
    }
}

export const getUnreadCommentsCount = async(username) =>{
    try{
        const result = await baseAxios.get(`/houseworker/comments/count/unread/${username}`)
        const count = result.data;
        return count;
    }catch(err){
        ThrowErorr(err);
    }
}

export const getConversationCount = async(userRedisID) =>{
    try{
        const result = await baseAxios.get(`/chat/conversationCount/${userRedisID}`)
        const count = result.data;
        return count;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getAllCities = async() =>{
    try{
        const result = await baseAxios.get(`/houseworker/cities`);
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
        const result = await baseAxios.get(`/houseworker/professions/all`);
        const professionsResult = result.data;
        return professionsResult;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHouseworkerByFilter = async(params) =>{
    try{
        const result = await baseAxios.get(`/houseworker/filter?${params}`);
        const houseworkers = result.data;
        return houseworkers;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHomeInfo= async(username) =>{
    try{
        const result = await authenticatedAxios.get(`/houseworker/home/${username}`)
        const homeInfo = result.data;
        return homeInfo;
    }
    catch(err){
        ThrowErorr(err);
    }
}

//This is equivalent to Promise.All(for both request )
export const getProfessionsAndCities = async() =>{
    try{
        const response = await axios.all([
            await baseAxios.get('/houseworker/professions/all'),
            await baseAxios.get('/houseworker/cities')
        ]);
        return {houseworker_professions: response[0].data, houseworker_cities: response[1].data}
    }
    catch(err){
        console.error(err);
        ThrowErorr(err);
    }
}

export const getProfessionsAndRating = async(username) =>{
    try{
        // const response = await axios.all([
        //     await axios.get(BASE_URL + `houseworker/professions/${username}`),
        //     await axios.get(BASE_URL + `houseworker/rating/${username}`)
        // ])
        // return {professions:response[0].data, rating:response[1].data}
        const result = await baseAxios.get(`/houseworker/professionsandrating/${username}`)
        const houseworkerData = result.data;

        return {professions:houseworkerData.professions, rating:houseworkerData.avgRating}
    }
    catch(err){
        console.error(err);
        ThrowErorr(err);
    }
}

export const getNotifications = async(username) =>{
    try{
        const result = await authenticatedAxios.get(`/houseworker/notifications/${username}?offset=0&size=10`)
        const notifications = result.data;
        return notifications;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getMoreNotifications = async(username, batchNumber) =>{
    try{
        const result = await authenticatedAxios.get(`/houseworker/notifications/${username}/${batchNumber}`)
        const notifications = result.data;
        return notifications;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const markNotificationAsRead = async(notificationID, batchNumber) =>{
    try{
        await authenticatedAxios.put(`/houseworker/notifications/mark/`, {notificationID, batchNumber})
    }
    catch(err){
        ThrowErorr(err);
    }
}