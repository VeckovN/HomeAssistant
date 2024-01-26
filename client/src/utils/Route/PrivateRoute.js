import { useSelector} from 'react-redux';
import { Navigate} from 'react-router-dom'; 

const PrivateRoute = ({children, privacy}) =>{
    const {user} = useSelector((state) => state.auth)  

    const isAuthenticated = () =>{
        if(user)
            return true;
        return false;
    }

    const isAuthorized = () =>{
        if(privacy != undefined){
            if(privacy === "houseworker" && user.type === "Client"){
                return false;
            }
        
            if (privacy === "client" && user.type === "Houseworker"){
                return false;
            }

            return true;
        }
        return true;
    }

    return isAuthenticated() ? (
        isAuthorized() ? children : <Navigate to ='/'/>
    ) : (
        <Navigate to ='/login'/>
    )
}

export default PrivateRoute;