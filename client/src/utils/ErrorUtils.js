import { toast } from "react-toastify";

export const ThrowErorr = (error) =>{
    if(error.response){
        throw error;
        //this rethrows the existing error object (HTTP error -{error:''})
        //error.response know without .data.error etc Request faiuld with status code 404' 
    }
    else if(error.request){
        throw new Error("Network error. Please check your connection.");
        //this create new error with custom message
    }
    else 
        throw new Error(error.message || "An unknon wrror occurred.");
    
}
//controllers send res.status(404).json({error:'Comments Count error'});
//with error.response. we got this json object and send 

export const getErrorMessage = (err) =>{
    if(err.response?.data?.error){
        // Specific error message from server response
        return {messageError: err.response.data.error};
    }
    else if (err.message){
        //General error messsage from error object
        return {messageError: err.message};
    }
    else{
        //Fallback message if no specific error is found
        return {messageError: "An error occurred. Please try again later."}
    }
}

export const handlerError = (err) =>{
    const { messageError } = getErrorMessage(err);
    toast.error(`${messageError}`, {
        className: 'toast-contact-message'
    });
    console.error(err);
} 
