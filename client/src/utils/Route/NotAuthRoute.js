import { useSelector} from 'react-redux';
import { Navigate} from 'react-router-dom'; 

const NotAuthRoute = ({children}) =>{
    const {user} = useSelector((state) => state.auth)  
    const isAuthenticated = () =>{
        if(user)
            return true;
        return false;
    }

    return isAuthenticated() ? (
        <Navigate to ='/' />
    ) : (
        children
    )
}

export default NotAuthRoute;