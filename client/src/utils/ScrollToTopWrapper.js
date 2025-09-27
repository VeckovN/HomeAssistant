import { useEffect} from "react"
import { useLocation} from "react-router-dom"

const ScrollToTopWrapper = ({children}) =>{
    const {pathname} = useLocation(); //return currentURL

    useEffect( ()=>{
        window.scrollTo(0,0);
    },[pathname]);

  
    return children
}

export default ScrollToTopWrapper;