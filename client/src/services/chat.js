import { ThrowErorr } from '../utils/ThrowError'
const BASE_URL = 'http://localhost:5000/api/'

import { axiosSession } from '../utils/AxiosInterceptors'

export const getUserRooms = async(username) =>{
    try{
        const result = await axiosSession.get(BASE_URL + `chat/rooms/${username}`)
        const data = result.data;
        return data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getMessagesByRoomID = async(roomID) =>{
    try{
        const result = await axiosSession.get(BASE_URL + `chat/room/${roomID}/messages?offset=0&size=50`)
        //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
        //const messages = JSON.parse(result.data);
        const messages = result.data;
        return messages;
    }
    catch(err){
        ThrowErorr(err);
    }
}

//BECAUSE THIS SERVICES CATCH ERROR FROM CONTROLLER , THIS ERROR SHOULD BE RE-THROW IN COMPOENNT
export const deleteRoom = async(roomID) =>{
    try{
        const result = await axiosSession.post(BASE_URL +'chat/room/delete', {roomID:roomID});
        return result; //message 'Room sucessfully deleted'
    }
    catch(err){
        // const errorMessage = (err.response && err.response.data.error) || err;
        // throw new Error(errorMessage);
        ThrowErorr(err);
    }
}

export const addUserToRoom = async(roomInfo) =>{
    try{
        //roomInfo{
        //   roomID
        //   newUsername
        //}
        const result = await axiosSession.post( BASE_URL + 'chat/room/addUser',roomInfo);
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}


