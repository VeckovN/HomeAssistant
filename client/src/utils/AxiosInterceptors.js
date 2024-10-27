import axios from "axios"
import { sessionExpired } from "../store/auth-slice";
import { resetReduxStates } from "../store/reset-states";

export const axiosSession = axios.create({
    withCredentials:true,
})


export const requestInterceptor = (dispatch) => axiosSession.interceptors.response.use(
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
            //logic
            return Promise.reject(error);
        }

        return Promise.reject(error); 
    }
);
