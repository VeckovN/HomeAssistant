import axios from 'axios'
import { ThrowErorr } from '../utils/ErrorUtils';
import { baseAxios, authenticatedAxios } from '../utils/AxiosConfig';

export const getUserData = async() =>{
    try{
        // const result = await authenticatedAxios.get(`/houseworkers/info`);
        const result = await authenticatedAxios.get(`/houseworkers/profile`);
        const houseworkerResult = result.data;
        return houseworkerResult;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHouseworkers = async() =>{
    try{
        const result = await baseAxios.get(`/houseworkers`);
        const houseworkerResult = result.data;
        return houseworkerResult;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHouseworkersCount = async() =>{
    try{
        // const result = await authenticatedAxios.get(`/houseworkers/count`)
        const result = await authenticatedAxios.get(`/houseworkers/stats/count`)
        const count = result.data;
        return count;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const updateHouseworker = async(formData) =>{
    try{
        //  await authenticatedAxios.put(`/houseworkers/update/`, formData, {
         await authenticatedAxios.put(`/houseworkers/profile`, formData, {
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
        await authenticatedAxios.put(`/houseworkers/professions`, {profession, working_hour});
    }
    catch(err){
        ThrowErorr(err);
    }
}

//user of authenticated user(username taken from session data)
export const getAuthenticatedUserComments = async(pageNumber) =>{
    try{
        // const result = await authenticatedAxios.get(`/houseworkers/ourcomments/${pageNumber}`);
        const result = await authenticatedAxios.get(`/houseworkers/comments/my/${pageNumber}`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getComments = async(username, pageNumber) =>{
    try{
        // const result = await authenticatedAxios.get(`/houseworkers/comments/${username}/${pageNumber}`);
        const result = await authenticatedAxios.get(`/houseworkers/${username}/comments/${pageNumber}`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getUnreadComments = async(username) =>{
    try{
        const result = await authenticatedAxios.get(`/houseworkers/${username}/comments/unread`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const markUnreadComments = async(username) =>{
    try{
        const result = await authenticatedAxios.put(`/houseworkers/${username}/comments/unread/mark`);
        const comms = result.data;
        return comms;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const postComment = async(newComment) =>{
    try{
        // const result = await authenticatedAxios.post(`/clients/comment`, newComment);
        const result = await authenticatedAxios.post(`/clients/comments`, newComment);
        const commentResult = result.data;
        return commentResult;
    }catch(err){
        ThrowErorr(err);
    }
}

export const rateUser = async(rateObject) =>{
    try{
        // const postResult = await authenticatedAxios.post('/clients/rate', rateObject)
        const postResult = await authenticatedAxios.post('/clients/rating', rateObject)
        const postResultData = postResult.data;
        //fetch newRate(new calcuation of avarage rate)
        // const result = await baseAxios.get(`/houseworkers/rating/${rateObject.houseworkers}`)
        const result = await baseAxios.get(`/houseworkers/${rateObject.houseworkers}/rating`)
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
        // const result = await baseAxios.get(`/houseworkers/rating/${username}`)
        const result = await baseAxios.get(`/houseworkers/${username}/rating`)
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
        const result = await baseAxios.get(`/houseworkers/professions`)
        const professionsArray = result.data; 
        return professionsArray;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getProfessionsByUsername = async(username)=>{
    try{
        // const result = await baseAxios.get(`/houseworkers/professions/${username}`)
        const result = await baseAxios.get(`/houseworkers/${username}/professions`)
        const professionsArray = result.data; 
        return professionsArray;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const addProfession = async(label, working_hour) =>{
    try{
        // const result = await baseAxios.post('/houseworkers/professions/add', {profession:label, working_hour:working_hour});
        const result = await baseAxios.post('/houseworkers/professions', {profession:label, working_hour:working_hour});
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const deleteProfession = async(profession) =>{
    try{
        const result = await baseAxios.delete(`/houseworkers/professions/${profession}`);
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getCommentsCount = async(username) =>{
    try{
        // const result = await baseAxios.get(`/houseworkers/comments/count/${username}`)
        const result = await baseAxios.get(`/houseworkers/${username}/comments/count`)
        const count = result.data;
        return count;
    }catch(err){
        ThrowErorr(err);
    }
}

export const getUnreadCommentsCount = async(username) =>{
    try{
        const result = await baseAxios.get(`/houseworkers/comments/count/unread/${username}`)
        const count = result.data;
        return count;
    }catch(err){
        ThrowErorr(err);
    }
}

export const getConversationCount = async(userRedisID) =>{
    try{
        // const result = await baseAxios.get(`/chat/conversationCount/${userRedisID}`)
        const result = await baseAxios.get(`/chat/stats/conversation-count/${userRedisID}`)
        const count = result.data;
        return count;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getAllCities = async() =>{
    try{
        const result = await baseAxios.get(`/houseworkers/cities`);
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
        const result = await baseAxios.get(`/houseworkers/professions/all`);
        const professionsResult = result.data;
        return professionsResult;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHouseworkerByFilter = async(params) =>{
    try{
        const result = await baseAxios.get(`/houseworkers/filter?${params}`);
        const houseworkers = result.data;
        return houseworkers;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getHomeInfo= async(username) =>{
    try{
        const result = await authenticatedAxios.get(`/houseworkers/home/${username}`)
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
            await baseAxios.get('/houseworkers/professions/all'),
            await baseAxios.get('/houseworkers/cities')
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
        //     await axios.get(BASE_URL + `houseworkers/professions/${username}`),
        //     await axios.get(BASE_URL + `houseworkers/rating/${username}`)
        // ])
        // return {professions:response[0].data, rating:response[1].data}
        // const result = await baseAxios.get(`/houseworkers/professionsandrating/${username}`)
        // const result = await baseAxios.get(`/houseworkers/professions/summary/${username}`)
        const result = await baseAxios.get(`/houseworkers/${username}/professions/summary`)
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
        // const result = await authenticatedAxios.get(`/houseworkers/notifications/${username}?offset=0&size=10`)
        const result = await authenticatedAxios.get(`/houseworkers/${username}/notifications?offset=0&size=10`)
        const notifications = result.data;
        return notifications;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getMoreNotifications = async(username, batchNumber) =>{
    try{
        // const result = await authenticatedAxios.get(`/houseworkers/notifications/${username}/${batchNumber}`)
        const result = await authenticatedAxios.get(`/houseworkers/${username}/notifications/${batchNumber}`)
        const notifications = result.data;
        return notifications;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const markNotificationAsRead = async(notificationID, batchNumber) =>{
    try{
        await authenticatedAxios.put(`/houseworkers/notifications/mark`, {notificationID, batchNumber})
    }
    catch(err){
        ThrowErorr(err);
    }
}