import { useSelector, useDispatch} from 'react-redux';
import { Navigate} from 'react-router-dom'; 
import Cookie from 'js-cookie';
import { logout, sessionExpired } from '../store/auth-slice';


const PrivateRoute = ({children, privacy}) =>{

    const {user} = useSelector((state) => state.auth)  
    const user_type = user?.type;
    const dispatch = useDispatch();

    //i can check this does session exist in REACT
    const expressCookie = Cookie.get("sessionLog"); 

    const isAuthenticated = () =>{
        if(!expressCookie){
            dispatch(sessionExpired())
            return false;
        }

        if(privacy === "houseworker" && user_type === "Houseworker"){
            return true;
        }
        else if (privacy === "client" && user_type === "Client"){
            return true;
        }
        //without privacy (only logged user) 
        else if (user){ //default route for logged in users
            return true;
        }
        return false;
    }

    return isAuthenticated() ? (
        children //compnent
    ) : (
        <Navigate to ='/login' />
    )
}

export default PrivateRoute;