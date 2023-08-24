import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api/'

export const getUserData = async() =>{
    try{
        const result = await axios.get(BASE_URL + `clients/info`)
        const client_data = result.data;
        return client_data;
    }
    catch(err){
        console.log(err);
        throw new Error(err);
    }
}

export const updateClient = async(newData) =>{
    try{
        await axios.put(BASE_URL + `clients/update/`, newData);
    }
    catch(err)
    {
        console.log(err);
        throw new Error(err);
    }
}


export const getRecommended= async(username) =>{
    try{
        const result = await axios.get(BASE_URL + `clients/recommended/${username}`);
        const recommendedData = result.data;
        return recommendedData;
    }
    catch(err){
        throw new Error(err);
    }
}