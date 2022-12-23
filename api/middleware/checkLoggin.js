//authentication check regardless of the type of user
const isLogged = (req,res,next)=>{
    if(!req.session.user){
        return res.json({
            error:"User isn't authenticated"
        })
    }
    //if is authoriazied just move on other middleware()
    next();
}

const checkClient = (req,res,next)=>{
    if(!req.session.user)
        //if is authoriazied just move to the other middleware()
        return res.json({error:"User isn't authenticated"})
        
    if(req.session.user.type === 'Client')
        next();
    else
        return res.json({error:"You're not authorized"})
}

const checkHouseworker = (req,res,next)=>{
    if(!req.session.user)
        //if is authoriazied just move on other middleware()
        return res.json({error:"User isn't authenticated"})

    if(req.session.user.type === 'Houseworker')
        next();
    else
        return res.json({error:"You're not authorized"})
}

module.exports ={
    isLogged,
    checkClient,
    checkHouseworker
}