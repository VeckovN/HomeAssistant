// import axios from 'axios'
// axios.defaults.withCredentials = true;
import { ThrowErorr } from '../utils/ErrorUtils'
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

export const updateClient = async(formData) =>{
    try{
        await axiosSession.put(BASE_URL + `clients/update/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                // 'Content-Type': 'application/json',
            },
        });

    }
    catch(err)
    {
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