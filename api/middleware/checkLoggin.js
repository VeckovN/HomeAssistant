const extendSessionCookieMaxAge = (req,res) =>{
    if(req.session){
        const newMaxAge = 1000 * 60 * 60;

        // Update Redis
        req.session.cookie.maxAge = newMaxAge;
        req.session.touch(); // Save the updated session to Redis (This will only update Redis TTL)

        // Update browser cookie with FULL options
        res.cookie('sessionLog', req.cookies.sessionLog, {
            maxAge: newMaxAge,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
    }
}

//authentication check regardless of the type of user
const isLogged = (req,res,next)=>{
    if(!req.session.user){
        return res.status(401).json({
            error:"User isn't authenticated"
        })
    }

    extendSessionCookieMaxAge(req,res);
    next();
}


const checkClient = (req,res,next)=>{
    if(!req.session.user){
        //if is authoriazied just move to the other middleware()
        return res.status(401).json({error:"User isn't authenticated"});        
    }

    //etc. if the user is logged as Houseworker and trying to access Client endpoint- return 403 status
    if(req.session.user.type === 'Houseworker'){
        return res.status(403).json({error:"Forbidden for you"});
    }
        
    if(req.session.user.type === 'Client'){
        extendSessionCookieMaxAge(req,res);
        next();
    }    
    else
    {
        return res.status(401).json({error:"You're not authorized"})
    }
}

const checkHouseworker = (req,res,next)=>{
    if(!req.session.user)
        return res.status(401).json({error:"User isn't authenticated"})

    if(req.session.user.type === 'Client'){
        return res.status(403).json({error:"Forbidden for you"});
    }

    if(req.session.user.type === 'Houseworker'){
        extendSessionCookieMaxAge(req,res)
        next();
    }
    else
        return res.status(401).json({error:"You're not authorized"})
}

module.exports ={
    isLogged,
    checkClient,
    checkHouseworker
}