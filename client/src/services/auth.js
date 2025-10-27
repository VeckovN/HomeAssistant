import { ThrowErorr } from '../utils/ErrorUtils';
import { baseAxios } from '../utils/AxiosConfig';

export const loginService = async(user)=>{
    try{
        const response = await baseAxios.post('/login', user);
        return response;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const registerService = async(userFormData) =>{
    try{
        const response = await baseAxios({
            method: 'post',
            url: '/register',
            data: userFormData,
            headers: {
                'Content-Type': `multipart/form-data`,
            },
        });
        return response;
    }
    catch(err){
        ThrowErorr(err);
    }
}

export const logoutService = async() =>{
    await baseAxios.post('/logout');
}

