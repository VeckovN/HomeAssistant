// import axios from 'axios'
// axios.defaults.withCredentials = true;
import { ThrowErorr } from '../utils/ThrowError'
const BASE_URL = 'http://localhost:5000/api/'

import { axiosSession } from '../utils/AxiosInterceptors'

export const getUserData = async() =>{
    try{
        const result = await axiosSession.get(BASE_URL + `clients/info`)
        const client_data = result.data;
        return client_data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const updateClient = async(newData) =>{
    try{
        await axiosSession.put(BASE_URL + `clients/update/`, newData);
    }
    catch(err)
    {
        //!!!BAD THROWING ERRORS
        
        //use new Error to create err.reponse() or if reponse exists only reThrow error 
        //check does error.response exist
        //for example if is returned  return res.status(400).json({error:"User with this email exists"})
        //reponse.data.error exists
        // if(err.response){
        //     console.log("HTTP RESPONSE ERROR: " , err.response)
        //     throw err;
        //     //in client err.response.data.error
        // }
        // else if(err.request){
        //     // Network error (no response received)
        //     console.log("NETWORK ERROR: ", err.request);
        //     throw new Error("Network error");
        // }
        // else {
        //     // Other errors
        //     console.error("Other error:", err);
        //     throw new Error(err.message);
        // }
        ThrowErorr(err);
    }
}

//query params - Mostly used for DELETE
export const deleteComment = async(client_username, comment_id) =>{
    try{
        const params = {client_username: client_username, comment_id: comment_id}
        await axiosSession.delete(BASE_URL + `clients/comment`, {params})
    }
    catch(err){
        ThrowErorr(err);
    }
}

//axios default
export const getRecommended= async(username) =>{
    try{
        const result = await axiosSession.get(BASE_URL + `clients/recommended/${username}`);
        const recommendedData = result.data;
        return recommendedData;
    }
    catch(err){
        ThrowErorr(err);
    }
}