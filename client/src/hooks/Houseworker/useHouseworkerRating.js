import {useState, useEffect} from 'react';
import { toast } from 'react-toastify';
import {rateUser} from '../../services/houseworker.js'
import {getProfessionsAndRating} from '../../services/houseworker.js';
import { emitRatingNotification } from '../../sockets/socketEmit.js';
import { getErrorMessage } from '../../utils/ErrorUtils.js';

const useHouseworkerRating = (socket, isClient, clientUsername, houseworkerUsername) =>{

    const [rate, setRate] = useState(''); //value from input
    const [showRateInput, setShowRateInput] = useState();
    const [houseworkerRating, setHouseworkerRating] = useState(null); //houseworker current ranking value
    const [houseworkerProfessions, setHouseworkerProfessions] = useState('');
    const [loadingRating, setLoadingRating] = useState(true);

    const fetchProfessionAndRating = async( ) =>{
        const result = await getProfessionsAndRating(houseworkerUsername);
        setHouseworkerRating(result.rating);
        setHouseworkerProfessions(result.professions);
        setLoadingRating(false);
    }

    useEffect(()=>{
        fetchProfessionAndRating();
    },[houseworkerUsername])


    var showRateInputCssClass =''
    if(!showRateInput)
        showRateInputCssClass ='open-rate-button'
    else
        showRateInputCssClass ='accept-rate-button'

    const onRateHandler = async(e)=>{
        const username = e.target.value
        const id = e.target.id;
        const rateInt = parseInt(rate)

        if(!isClient){
            toast.error("Login in to rate",{
                className:"toast-contact-message"
            })
            return 
        }
        //when rate value doesn't exist , again click on Rate button will close input
        if(rate == ''){
            setShowRateInput(prev => !prev);
        }
        else {
            try{
                const rateObj ={
                    client: clientUsername,
                    houseworker: username,
                    rating:rateInt
                }

                const ratingResult = await rateUser(rateObj);
                const newRateObj = {...rateObj, ...ratingResult, houseworkerID:id}
                emitRatingNotification(socket, newRateObj);

                toast.success(`You have rated the ${username} with rate ${rateInt} `,{
                    className:'toast-contact-message'
                })

                onCloseRateHandler();
            }
            catch(err){
                const error = getErrorMessage(err);
                const errorMessage = error.messageError || "Please try again later";
                toast.error(`Failed to rate the user. ${errorMessage}`, {
                    className: 'toast-contact-message'
                });
                console.error(error);
            }
        }
    }

    const onCloseRateHandler =()=>{
        setShowRateInput(false);
        setRate('');
    }

    const onChangeRate = (e)=>{
        setRate(e.target.value);
    }

    return {rate, houseworkerRating, houseworkerProfessions, loadingRating, showRateInput, showRateInputCssClass, onRateHandler, onCloseRateHandler, onChangeRate}

}

export default useHouseworkerRating;