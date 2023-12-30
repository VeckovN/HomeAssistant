import { useLocation } from "react-router-dom"
import { useEffect, useLayoutEffect } from "react"

//When is Link clicked(pathanme changed) the page is open but with same position of pervious page (not scrolled automatically on top of page) 
const ScrollToTopWrapper = ({children}) =>{
    const { pathname} = useLocation(); //return currentURL

    useEffect( ()=>{
        window.scrollTo(0,0);
    },[pathname]);

    //useLayoutEffect is a version of useEffect that fires before the browser repaints the screen.
    //use if notice any visual artifact.Since it runs synchronously may reduce performance
    useLayoutEffect( ()=>{
        // document.documentElement.scrollTo(0,0);
        window.scrollTo(0,0);
    },[pathname])

    return children;
}

export default ScrollToTopWrapper;