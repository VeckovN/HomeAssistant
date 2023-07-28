import axios from 'axios'

const BASE_URL = 'http://localhost:5000/api/'

export const getUserData = async() =>{
    try{
        const result = await axios.get(BASE_URL + `/clients/info`)
        const client_data = result.data;
        return client_data;
    }
    catch(err){
        console.log(err);
    }
}

export const updateClient = async(newData) =>{
    const result = await axios.put(BASE_URL + `/clients/update/`, newData);
    const user = result.data;
    return user;
}

//move this to houseworker services?
export const getHouseworkerByFilter = async(params) =>{
    const result = await axios.get(BASE_URL + `/houseworker/filter?${params}`);
    const houseworkers = result.data;
    return houseworkers;;
}

export const getRecommended= async(username) =>{
    const result = await axios.get(BASE_URL + `/clients/recommended/${username}`);
    const recommendedData = result.data;
}