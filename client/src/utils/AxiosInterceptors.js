import axios from "axios"
import { sessionExpired } from "../store/auth-slice";

export const axiosSession = axios.create({
    withCredentials:true,
})


export const requestInterceptor = (dispatch) => axiosSession.interceptors.response.use(
    response => {return response},
    (error) =>{
        //hanlde session cookie expiration
        if(error.response.status === 401){
            dispatch(sessionExpired());
            return Promise.reject(error);
        }   
        return Promise.reject(error);
    }
);
