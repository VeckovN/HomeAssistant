import { useSelector } from 'react-redux';
import { Navigate, Outlet} from 'react-router-dom'; 

const PrivateRoute = ({children, privacy}) =>{

    const {user} = useSelector((state) => state.auth)  
    const user_type = user?.type;
    //user_type woudn't exist if there was no user(logged-in)

    const isAuthenticated = () =>{
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