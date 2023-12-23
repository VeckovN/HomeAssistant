import {Navigate} from 'react-router-dom'; 
import Cookie from 'js-cookie';
import {logout, sessionExpired} from '../store/auth-slice';

//HOC Function 
export const withSessionCheck = (handler, user, authDispatch) => async (e) =>{
    let sessionValid = true;

    const user_type = user?.type;

    const expressCookie = Cookie.get("sessionLog"); 
    //expressCookie structure: s: SessionKey .dix8/EES/R/6BoLCF5onr+wyQ/PmZwM3BD6uwNPu/BUVM1048:1 
    //take only sessionKey
    console.log("EXPRESS COOK ", expressCookie);

    // const match = expressCookie.match(/s:(.*?)\./);
    // const sessionKey = match ? match[1] : null;
    // console.log("SessionKey", sessionKey);

    //THIS CHECK ONLY ON CLIENT-SIDE SESSION TIME - REDIS SESSION IS OMITTED
    //REdis session time is extended on every action, 
    //BUT sessionLog(Express COOKIE) time didn't extend
    if(!expressCookie || expressCookie == undefined){
        authDispatch(sessionExpired())
        // return false;
        sessionValid = false;
    }

    if(!sessionValid){
        console.log("Session expired. REDIRECT");
        <Navigate to ='/login'/>
        return;
    }

    handler(e);
}
