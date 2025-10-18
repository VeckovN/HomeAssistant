import {useState, useEffect} from 'react';
import {handlerError} from '../../utils/ErrorUtils.js';
import {toast} from 'react-toastify';
import {rateUser} from '../../services/houseworker.js'
import {getProfessionsAndRating} from '../../services/houseworker.js';
import {emitRatingNotification} from '../../sockets/socketEmit.js';

const useHouseworkerRating = (socket, isClient, clientUsername, houseworkerUsername) =>{
    const [rate, setRate] = useState(''); //value from input
    const [showRateInput, setShowRateInput] = useState();
    const [houseworkerRating, setHouseworkerRating] = useState(null); //houseworker current ranking value
    const [houseworkerProfessions, setHouseworkerProfessions] = useState('');
    const [loadingRating, setLoadingRating] = useState(true);

    const fetchProfessionAndRating = async() =>{
        try{
            const result = await getProfessionsAndRating(houseworkerUsername);
            setHouseworkerRating(result.rating);
            setHouseworkerProfessions(result.professions);
            setLoadingRating(false);
        }
        catch(err){
            console.error(err);
            // handlerError(err);
        }
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
                handlerError(err);
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