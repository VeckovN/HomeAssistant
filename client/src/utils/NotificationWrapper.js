import { useEffect} from "react"
import { useNavigate} from "react-router-dom"
import {useSelector} from 'react-redux';
import {toast} from 'react-toastify';

const NotificationWrapper = ({children}) =>{

    const {user, message, error, success} = useSelector((state) => state.auth) //null when not exists
    const navigate = useNavigate();

    //listener for showing login notification
    useEffect(()=>{
        if(error)
            toast.error(message,{
                className:'toast-contact-message'
            })
    
        if(success){
            navigate('/')
            toast.success(message,{
                className:'toast-contact-message'
            })
        }
    },[user,error,success])

    return (
        <>
            {children}
        </>)
}

export default NotificationWrapper;