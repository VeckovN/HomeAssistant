import axios from "axios"
import { sessionExpired } from "../store/auth-slice";
import { resetReduxStates } from "../store/reset-states";

const BASE_URL =
  process.env.NODE_ENV === 'production'   
    ? 'https://homeassistant-ed5z.onrender.com/api'        
    : 'http://localhost:5000/api';


export const baseAxios = axios.create({
    baseURL: BASE_URL
})

export const authenticatedAxios = axios.create({
    baseURL: BASE_URL,
    withCredentials:true
})

export const requestInterceptor = (dispatch) => authenticatedAxios.interceptors.response.use(
    response => {return response},
    (error) =>{
        //401 status on not authenticated users (when is session expired server will return 401 status)
        if(error.response.status === 401){
            //reset all redux states
            resetReduxStates(dispatch);
            dispatch(sessionExpired()); //user-auth state will be reseted 
        
            return Promise.reject(error);   
        }
    
        //don't logout(removeSession) on not Authorized request
        if(error.response.status === 403){
            return Promise.reject(error);
        }

        return Promise.reject(error); 
    }
);
