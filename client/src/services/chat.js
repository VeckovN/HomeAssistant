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
        const result = await axiosSession.get(BASE_URL + `chat/room/${roomID}/messages?offset=0&size=16`)
        const messages = result.data;
        return messages;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getMoreMessagesByRoomID = async(roomID, pageNumber) =>{
    console.log("\n PAGE NUMBER: " , pageNumber);
    try{
        const result = await axiosSession.get(BASE_URL + `chat/room/message/${roomID}/${pageNumber}`)
        const messages = result.data;
        return messages;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const deleteRoom = async(roomID) =>{
    try{
        const result = await axiosSession.delete(BASE_URL +`chat/room/delete/${roomID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const addUserToRoom = async(roomInfo) =>{
    try{
        const result = await axiosSession.post( BASE_URL + 'chat/room/addUser',roomInfo);
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const removeUserFromGroup = async(roomInfo) =>{
    try{
        const result = await axiosSession.delete(BASE_URL + `chat/room/removeUser/${roomInfo.roomID}/${roomInfo.username}`);
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const sendMessageToUser = async(messageObj) =>{
    try{
        const result = await axiosSession.post(BASE_URL + 'chat/room/message', messageObj);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getOnlineUsers = async(userID) =>{
    try{
        const result = await axiosSession.get(BASE_URL + `chat/room/onlineUsers/${userID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getFirstRoomID = async(userID) =>{
    try{
        const result = await axiosSession.get(BASE_URL + `chat/room/firstRoom/${userID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getFriendsList = async(userID) =>{
    try{
        const result = await axiosSession.get(BASE_URL + `chat/room/friends/${userID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}


export const getAllUnreadMessages = async(username) =>{
    try{
        const result = await axiosSession.get(BASE_URL + `chat/room/unread/${username}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getUnreadTotalCountMessages = async(userID) =>{
    try{
        const result = await axiosSession.get(BASE_URL + `chat/room/unread/count/${userID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const resetUnreadMessagesCount = async(roomID, userID) =>{
    try{
        const result = await axiosSession.delete(BASE_URL + `chat/room/unread/delete/${roomID}/${userID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}


