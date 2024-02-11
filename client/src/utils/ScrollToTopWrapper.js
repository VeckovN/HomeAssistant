import { useEffect} from "react"
import { useLocation} from "react-router-dom"
import {useSelector} from 'react-redux';
import Footer from "../components/Layout/Footer";


//When is Link clicked(pathanme changed) the page is open but with same position of pervious page (not scrolled automatically on top of page) 
const ScrollToTopWrapper = ({children}) =>{
    const {user} = useSelector((state) => state.auth) //null when not exists
    const {pathname} = useLocation(); //return currentURL

    useEffect( ()=>{
        window.scrollTo(0,0);
    },[pathname]);

    //Footer is not just rendered in Home
    return (
        <>
            {children}
            {(pathname !== '/' & user?.type!=="Houseworker") ? <Footer/> : null} 
        </>
    )
}

export default ScrollToTopWrapper;