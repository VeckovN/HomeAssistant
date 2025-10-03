import {useState, useEffect} from 'react';
import { baseAxios } from '../../utils/AxiosConfig';

import '../../sass/components/_entryLoadingScreen.scss';

const EntryAppLoadingScreen = ({children}) => {
    const [loading, setLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Initializing application...");
    const [fadeOut, setFadeOut] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [fadeInRender, setFadeInRender] = useState(false);

    useEffect(() => {
        const laodApp = async () => {
            try {
                setTimeout(() =>{
                    setLoadingText("Connecting to server");
                }, 1000);

                setTimeout(() =>{
                    setFadeInRender(true);
                },4000);
        
                await baseAxios.get('/health');

                setTimeout(() => {
                    setFadeOut(true);
                }, 2700);

                // Show content slightly before removing loading screen
                setTimeout(() => {
                    setShowContent(true);
                }, 2900);

                // Remove loading screen after fade out completes
                setTimeout(() => {
                    setLoading(false);
                }, 3300);
            }
            catch(error){
                setFadeOut(true);
                setShowContent(true);
                setTimeout(() => {
                    setLoading(false);
                }, 3300);
            }
        }

        laodApp();
    },[]);


    if(loading) {
        return (
            <div className={`entry-loading-screen ${fadeOut ? 'fade-out' : ''}`}>
                <div className='loading-container'>
                    <div className={`entry-loading-render-text ${fadeInRender ? "fade-in-render-deploy" : ""}`}>
                        <p>Since this project is deployed on a free Render instance, the first request may take a bit longer while the server warms up.</p>
                    </div>

                    <div className='logo-container'>
                        <div className='logo'>
                            <span className='logo-span'>Home</span> 
                            <span className='logo-span'>Assistant</span>
                        </div>
                    </div>
            
                    <div className='loading-content'>
                        <div className='loading-text-container'>
                            <p className='loading-text'>{loadingText}</p>
                            <div className="pulse-indicator-container">
                                <div className="pulse-indicator"></div>
                            </div>
                        </div>
                        <div className='spinner-ring'>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    return (
        <div className={`app-content ${showContent ? 'fade-in' : ''}`}>
            {children}
        </div>
    )
}

export default EntryAppLoadingScreen;