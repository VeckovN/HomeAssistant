import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import HashLoader from 'react-spinners/HashLoader'

import '../../sass/components/_routeLoadingFallback.scss'

const RouteLoadingFallback = ({client}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`route-loading-fallback ${client ? 'client': ''}`}>
            {isVisible && (
            <div className="loading-screen-content">
                <HashLoader 
                    color="rgba(255, 255, 255, 0.9)"
                    size={36}
                    speedMultiplier={1.5}
                />
                <span className="route-loading-text">Loading...</span>
            </div>
            )}
        </div>
    );
};

const RouteSuspense = ({ children, client = false}) => {
    return (
        <Suspense fallback={<RouteLoadingFallback client={client}/>}>
            {children}
        </Suspense>
    );
};

export default RouteSuspense;