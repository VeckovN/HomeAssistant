const extendSessionCookieMaxAge = (req,res,maxAge) =>{
    // const newMaxAge = 1000 * 60 * 10;
    const newMaxAge = maxAge;
    const currentCookie = req.cookies.sessionLog;
    // Set the updated cookie in the response headers
    res.cookie('sessionLog', currentCookie, { maxAge: newMaxAge });
}

//authentication check regardless of the type of user
const isLogged = (req,res,next)=>{
    if(!req.session.user){
        return res.status(401).json({
            error:"User isn't authenticated"
        })
    }
    //if is authoriazied just move on other middleware()
    const maxAge = 1000 * 60 * 10;
    extendSessionCookieMaxAge(req,res,maxAge);

    next();
}


const checkClient = (req,res,next)=>{
    if(!req.session.user){
        //if is authoriazied just move to the other middleware()
        console.log("User isn't authenticated");
        return res.status(401).json({error:"User isn't authenticated"});        
    }
        
    if(req.session.user.type === 'Client'){
        const maxAge = 1000 * 60 * 10;
        extendSessionCookieMaxAge(req,res,maxAge);
        
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
        //return new Error({message:"Not Authenticated"});

    if(req.session.user.type === 'Houseworker'){
        const maxAge = 1000 * 60 * 10;
        extendSessionCookieMaxAge(req,res,maxAge)

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