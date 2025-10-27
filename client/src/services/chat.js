import { ThrowErorr } from '../utils/ErrorUtils'
import { authenticatedAxios } from '../utils/AxiosConfig'

export const getUserRooms = async(username) =>{
    try{
        const result = await authenticatedAxios.get(`/chat/rooms/${username}`)
        const data = result.data;
        return data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getMessagesByRoomID = async(roomID) =>{
    try{
        // const result = await authenticatedAxios.get(`/chat/room/${roomID}/messages?offset=0&size=16`)
        const result = await authenticatedAxios.get(`/chat/rooms/${roomID}/messages?offset=0&size=16`)
        const messages = result.data;
        return messages;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getMoreMessagesByRoomID = async(roomID, pageNumber) =>{
    try{
        // const result = await authenticatedAxios.get(`/chat/room/message/${roomID}/${pageNumber}`)
        const result = await authenticatedAxios.get(`/chat/rooms/${roomID}/messages/${pageNumber}`)
        const messages = result.data;
        return messages;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const deleteRoom = async(roomID) =>{
    try{
        // const result = await authenticatedAxios.delete(`/chat/room/delete/${roomID}`);
        const result = await authenticatedAxios.delete(`/chat/rooms/${roomID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const addUserToRoom = async(roomInfo) =>{
    try{
        // const result = await authenticatedAxios.post('/chat/room/addUser',roomInfo);
        const result = await authenticatedAxios.post('/chat/rooms/users',roomInfo);
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const removeUserFromGroup = async(roomInfo) =>{
    try{
        // const result = await authenticatedAxios.delete(`/chat/room/removeUser/${roomInfo.roomID}/${roomInfo.username}`);
        const result = await authenticatedAxios.delete(`/chat/rooms/${roomInfo.roomID}/users/${roomInfo.username}`);
        return result;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const sendMessageToUser = async(messageObj) =>{
    try{
        // const result = await authenticatedAxios.post('/chat/room/message', messageObj);
        const result = await authenticatedAxios.post('/chat/rooms/messages', messageObj);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getOnlineUsers = async(userID) =>{
    try{
        // const result = await authenticatedAxios.get(`/chat/room/onlineUsers/${userID}`);
        const result = await authenticatedAxios.get(`/chat/online-users/${userID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getFirstRoomID = async(userID) =>{
    try{
        // const result = await authenticatedAxios.get(`/chat/room/firstRoom/${userID}`);
        const result = await authenticatedAxios.get(`/chat/users/${userID}/firstRoom`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getFriendsList = async(userID) =>{
    try{
        // const result = await authenticatedAxios.get(`/chat/room/friends/${userID}`);
        const result = await authenticatedAxios.get(`/chat/friends/${userID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}


export const getAllUnreadMessages = async(username) =>{
    try{
        // const result = await authenticatedAxios.get(`/chat/room/unread/${username}`);
        const result = await authenticatedAxios.get(`/chat/unread/${username}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getUnreadTotalCountMessages = async(userID) =>{
    try{
        // const result = await authenticatedAxios.get(`/chat/room/unread/count/${userID}`);
        const result = await authenticatedAxios.get(`/chat/unread/count/${userID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const resetUnreadMessagesCount = async(roomID, userID) =>{
    try{
        // const result = await authenticatedAxios.delete(`/chat/room/unread/delete/${roomID}/${userID}`);
        const result = await authenticatedAxios.delete(`/chat/rooms/${roomID}/unread/${userID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const resetUsersUnreadMessagesCount = async(roomID, clientID) =>{
    try{
        // const result = await authenticatedAxios.delete(`/chat/room/unread/delete/all/${roomID}/${clientID}`);
        const result = await authenticatedAxios.delete(`/chat/rooms/${roomID}/unread/all/${clientID}`);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const forwardUnreadMessagesFromOldToNewRoom = async(roomData) =>{
    try{
        // const result = await authenticatedAxios.put(`/chat/room/unread/forward/`, roomData);
        const result = await authenticatedAxios.put(`/chat/unread/forward`, roomData);
        return result.data;
    }
    catch(err){
        ThrowErorr(err);
    }
}