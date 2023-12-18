export const ThrowErorr = (error) =>{
    if(error.response){
        console.log("HTTP RESPONSE ERROR: " , error.response)
        throw error;
        //in client err.response.data.error
    }
    else if(error.request){
        // Network error (no response received)
        console.log("NETWORK ERROR: ", error.request);
        throw new Error("Network error");
    }
    else {
        // Other errors
        console.error("Other error:", error);
        throw new Error(error.message);
      }
}
//controllers send res.status(404).json({error:'Comments Count error'});
//with error.response. we got this json object and send 

export const getErorrMessage = (err) =>{
    const message = (err.response && err.response.data.error) || err.message || err
    return message;
}
//When is error.response iot send throw error(rethrowing the error)
//with error.response.data we access to json object which contains {error:''} or some props

