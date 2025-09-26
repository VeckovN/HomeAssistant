import { useState, useEffect } from 'react';
import HashLoader from 'react-spinners/HashLoader'

import '../../sass/components/_loadingScreen.scss';

const LoadingScreen = () => {
    const minDisplayTime = 200; // prevent flash
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const minTimer = setTimeout(() => {
            setFadeOut(true);

            const removeTimer = setTimeout(() => {
                setVisible(false);
            },500);

            return () => clearTimeout(removeTimer);

        }, minDisplayTime);

        return () => {
            clearTimeout(minTimer);
        };
    }, [ minDisplayTime]);

    if (!visible) return null;
    
    return (
        <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="loading-screen-content">
                <HashLoader 
                    color="rgba(255, 255, 255, 0.9)"
                    size={36}
                    speedMultiplier={1.5}
                />
                <span className="loading-screen-text">Loading...</span>
            </div>
        </div>
    )
}

export default LoadingScreen;