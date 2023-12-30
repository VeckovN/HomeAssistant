import { useSelector, useDispatch} from 'react-redux';
import { Navigate} from 'react-router-dom'; 
import Cookie from 'js-cookie';
import { logout, sessionExpired } from '../../store/auth-slice';

const PrivateRoute = ({children, privacy}) =>{
    const {user} = useSelector((state) => state.auth)  
    const user_type = user?.type;
    const dispatch = useDispatch();

    const userCookie = Cookie.get("user");
    const isAuthenticated = () =>{
        if(!userCookie){
            dispatch(sessionExpired())
            return false;
        }
        const user = JSON.parse(userCookie);

        if(privacy === "houseworker" && user.type === "Houseworker"){
            return true;
        }
        
        else if (privacy === "client" && user.type === "Client"){
            return true;
        }
        //without privacy (only logged user) 
        else if (user){ //default route for logged in users
            return true;
        }
        return false;
    }

    return isAuthenticated() ? (
        children 
    ) : (
        <Navigate to ='/login' />
    )
}

export default PrivateRoute;