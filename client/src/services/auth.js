import axios from 'axios'
axios.defaults.withCredentials = true;
const BASE_URL = 'http://localhost:5000/api/'


export const loginService = async(user)=>{
    try{
        const response = await axios.post(BASE_URL + '/login', user);
        return response;
    }
    catch(err){
        console.log(err);
    }
}


export const registerService = async(userFormData) =>{
    try{
        const response = await axios({
            method: 'post',
            url: 'http://localhost:5000/api/register',
            data: userFormData,
            headers: {
                'Content-Type': `multipart/form-data`,
            },
        });
        return response;
    }
    catch(err){
        console.log(err);
    }
}

export const logutService = async() =>{
    await axios.get('http://localhost:5000/api/logout');
}

