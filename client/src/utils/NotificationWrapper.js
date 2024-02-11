import { useEffect, useLayoutEffect } from "react"
import { useNavigate} from "react-router-dom"
import {useSelector} from 'react-redux';
import {toast} from 'react-toastify';

const NotificationWrapper = ({children}) =>{

    const {user, message, error, success} = useSelector((state) => state.auth) //null when not exists
    const navigate = useNavigate();

    //LISTENER FOR SHOWING Login NOTIFICATION
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

     //useLayoutEffect is a version of useEffect that fires before the browser repaints the screen.
    //use if notice any visual artifact.Since it runs synchronously may reduce performance
    // useLayoutEffect( ()=>{
    //     // document.documentElement.scrollTo(0,0);
    //     window.scrollTo(0,0);
    // },[pathname])


    return (
        <>
            {children}
        </>)
}

export default NotificationWrapper;