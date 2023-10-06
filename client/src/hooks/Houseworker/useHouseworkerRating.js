import {useState} from 'react';
import { toast } from 'react-toastify';
import {rateUser} from '../../services/houseworker.js'
import { emitRatingNotification } from '../../sockets/socketEmit.js';

const useHouseworkerRating = (socket, isClient, client_username) =>{

    const [rate, setRate] = useState('');
    const [showRateInput, setShowRateInput] = useState();

    var showRateInputCssClass =''
    if(!showRateInput)
        showRateInputCssClass ='open-rate-button'
    else
        showRateInputCssClass ='accept-rate-button'

    const onRateHandler = async(e)=>{
        const username = e.target.value
        const id = e.target.id;
        const rateInt = parseInt(rate)

        console.log("USER: " + username + "ID: " + id + " will be rated soon" )

        if(!isClient){
            toast.error("Login in to rate",{
                className:"toast-contact-message"
            })
            return 
        }
        //when rate value not exist , again click on Rate button 
        //will close input
        if(rate == '')
            setShowRateInput(prev => !prev);
        else {
            try{
                const rateObj ={
                    client: client_username,
                    houseworker: username,
                    rating:rateInt
                }

                console.log("JSON RATE OJVB : " + JSON.stringify(rateObj))

                const ratingValue = await rateUser(rateObj);
                emitRatingNotification(socket, {...rateObj, houseworkerID:id})


                toast.success(`You have rated the ${username} with rate ${rateInt} `,{
                    className:'toast-contact-message'
                })

                onCloseRateHandler();
            }
            catch(err){
                console.log('RateError: ' + err);
            }
        }
    }

    const onCloseRateHandler =()=>{
        setShowRateInput(false);
        setRate('');
    }

    const onChangeRate = (e)=>{
        // setRate(parseInt(e.target.value));
        setRate(e.target.value);
    }

    return {rate, showRateInput, showRateInputCssClass, onRateHandler, onCloseRateHandler, onChangeRate}

}

export default useHouseworkerRating;