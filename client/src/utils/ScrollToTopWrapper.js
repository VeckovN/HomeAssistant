import { useEffect, useLayoutEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {useSelector} from 'react-redux';
import Footer from "../components/Layout/Footer";
import {toast} from 'react-toastify';

//When is Link clicked(pathanme changed) the page is open but with same position of pervious page (not scrolled automatically on top of page) 
const ScrollToTopWrapper = ({children}) =>{
    const {user, message, error, success} = useSelector((state) => state.auth) //null when not exists
    const navigate = useNavigate();

    const {pathname} = useLocation(); //return currentURL

    useEffect( ()=>{
        window.scrollTo(0,0);
    },[pathname]);

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

    //Footer is not just rendered in Home
    return (
        <>
            {children}
            {(pathname !== '/' & user?.type!=="Houseworker") ? <Footer/> : null} 
        </>
    )
}

export default ScrollToTopWrapper;