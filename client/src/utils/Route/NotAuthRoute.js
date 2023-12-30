import { useSelector} from 'react-redux';
import { Navigate} from 'react-router-dom'; 
import Cookie from 'js-cookie';

const NotAuthRoute = ({children}) =>{
    const {user} = useSelector((state) => state.auth)  
    const userCookie = Cookie.get("user");
    const isAuthenticated = () =>{
        if(userCookie){
            return true;
        }
        return false;
    }

    return isAuthenticated() ? (
        <Navigate to ='/' />
    ) : (
        children
    )
}

export default NotAuthRoute;