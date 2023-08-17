import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api/'

export const getUserRooms = async(username) =>{
    try{
        const result = await axios.get(BASE_URL + `chat/rooms/${username}`)
        const data = result.data;
        return data;
    }
    catch(err){
        console.log(err);
    }
}

export const getMessagesByRoomID = async(roomID) =>{
    try{
        const result = await axios.get(BASE_URL + `chat/room/${roomID}/messages?offset=0&size=50`)
        //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
        //const messages = JSON.parse(result.data);
        const messages = result.data;
        return messages;
    }
    catch(err){
        console.log(err);
    }
}


export const deleteRoom = async(roomID) =>{
    try{
        const result = await axios.post(BASE_URL +'chat/room/delete', {roomID:roomID});
        return result; //message 'Room sucessfully deleted'
    }
    catch(err){
        console.log(err);
    }
}

export const addUserToRoom = async(roomInfo) =>{
    try{
        //roomInfo{
        //   roomID
        //   newUsername
        //}
        await axios.post( BASE_URL + 'chat/room/addUser',roomInfo);
    }
    catch(err){
        console.log(err);
    }
}


