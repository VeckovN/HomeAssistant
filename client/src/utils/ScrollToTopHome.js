import {useState, useEffect} from 'react';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import debounce from 'lodash/debounce'; 
import '../sass/components/_scrollToTopHome.scss';

const ScrollToTopHome = () =>{
    const [buttonState, setButtonState] = useState({showButton:false, delayedHide:false});
    const scrollThreshold = 1200;

    //debouncedHandleScroll calls are queued but not immediately executed.
    //Only the last queued call within the delay window determines the state update.
    useEffect( ()=>{
        const debouncedHandleScroll = () =>{
            if (window.scrollY >= scrollThreshold)
                setButtonState({showButton:true, delayedHide:false})
            else {
                setButtonState(prev => ({...prev, delayedHide:true}));
                // setButtonState({showButton:false, delayedHide:true})                    
            }
        }

        const throttledScroll = debounce(debouncedHandleScroll, 100);

        window.addEventListener('scroll', throttledScroll);

        return () => window.removeEventListener('scroll', throttledScroll);
    },[scrollThreshold]) // Dependency array for scrollThreshold

    useEffect( ()=>{
        let timeout;

        if(buttonState.delayedHide == true){
            // Apply fade-out class after a short delay when showButton becomes false
            timeout = setTimeout(() =>{
                setButtonState({showButton:false, delayedHide:false})
            },100)
        }
        return () =>{
            clearTimeout(timeout);
        }
    },[buttonState.delayedHide])


    const scrollToTop = () =>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        setButtonState(prev => ({...prev, delayedHide:true}));
    }

    return (
        buttonState.showButton && 
        <div className='scroll-div'>
            <button className={`scroll-to-top ${!buttonState.delayedHide ? 'fade-in' : 'fade-out'}`} onClick={scrollToTop}><KeyboardDoubleArrowUpIcon/></button>
        </div>   
    )
}

export default ScrollToTopHome;