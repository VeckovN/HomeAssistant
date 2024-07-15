export const ThrowErorr = (error) =>{
    if(error.response){
        throw error;
        //this rethrows the existing error object (HTTP error -{error:''})
        //error.response know without .data.error etc Request faiuld with status code 404' 
    }
    else if(error.request){
        throw new Error("Network error");
        //this create new error with custom message
    }
    else 
        throw new Error(error.message);
    
}
//controllers send res.status(404).json({error:'Comments Count error'});
//with error.response. we got this json object and send 

export const getErrorMessage = (err) =>{
    if(err.response.data && err.response.data.error)
        return {messageError:err.response.data.error};
    
    return err.message || err;
}
