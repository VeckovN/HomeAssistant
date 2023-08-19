import {useState} from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import {rateUser} from '../../services/houseworker.js'

const useHouseworkerRating = (isClient, client_username) =>{

    const [rate, setRate] = useState('');
    const [showRateInput, setShowRateInput] = useState();

    var showRateInputCssClass =''
    if(!showRateInput)
        showRateInputCssClass ='open-rate-button'
    else
        showRateInputCssClass ='accept-rate-button'

    const onRateHandler = async(e)=>{
        const username = e.target.value

        if(!isClient){
            toast.error("Uloguj se da bi ostavio ocenu",{
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
                    rating:rate
                }
                const rateResult = await rateUser(rateObj);
            
                toast.success(`Ocenili ste korisnika ${username} ocenom ${rate} `,{
                    className:'toast-contact-message'
                })
            }
            catch(err){
                console.log('RateError: ' + err);
            }
            
            // alert("YOU rated: " + username + " / With rate: " + rate + "YYPE :" + typeof(rate));
        }
    }

    const onCloseRateHandler =()=>{
        setShowRateInput(false);
        setRate('');
    }

    const onChangeRate = (e)=>{
        setRate(parseInt(e.target.value));
    }

    return {rate, showRateInput, showRateInputCssClass, onRateHandler, onCloseRateHandler, onChangeRate}

}

export default useHouseworkerRating;