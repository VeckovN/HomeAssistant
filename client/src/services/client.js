import { ThrowErorr } from '../utils/ErrorUtils'
import { authenticatedAxios } from '../utils/AxiosConfig';

export const getUserData = async() =>{
    try{
        const result = await authenticatedAxios.get(`/clients/info`)
        const client_data = result.data;
        return client_data;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const updateClient = async(formData) =>{
    try{
        await authenticatedAxios.put(`/clients/update/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
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
        await authenticatedAxios.delete(`/clients/comment`, {params})
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const getRecommended= async(username) =>{
    try{
        const result = await authenticatedAxios.get(`/clients/recommended/${username}`);
        const recommendedData = result.data;
        return recommendedData;
    }
    catch(err){
        ThrowErorr(err);
    }
}