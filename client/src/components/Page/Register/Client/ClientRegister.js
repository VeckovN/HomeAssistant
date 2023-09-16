import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'; //need be imported in App.js
import {register, reset} from '../../../../store/auth-slice'
import useUser from '../../../../hooks/useUser.js'
import ClientForm from './ClientForm';
import { city_options, profession_options } from '../../../../utils/options';

import '../Register.css'

const ClientRegister = () =>{
    //@TODO - Create custom hook for storing and manipulation with this data( repeated in onther components)
    const initialState ={
        username:'',
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        picture:'',
        city:'',
        gender:'',
        interests:[]
    }


    const {data, onChange, onChangeCity, onImageChange, onChangeInterest} = useUser(initialState);
    const {password, passwordRepeat} = data;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {user, loading, success, error, message} = useSelector( (state) => state.auth)

    //set spinner when is loading true
    // if(loading){
    //     return <Spiner></Spiner>
    // }

    useEffect( ()=>{
        //on every user,success,error,message state change chech status of states
        //and show the appropriate notification
        if(error)
            toast.error(message);
        
        //register.fulfilled trigger success=true (when is register success )
        //or if user is logged (after register) 
        if(success || user){
            alert("SSSSS");
            console.log("@@#!@#!@#!@$!&@*#^!@&*(#^!&*(@#^&*!@^&#");
            navigate('/');
            //toast.success(message);
            toast.success("You have successfully created account",{
                className:'toast-contact-message'
            })
        }
        //after all of this actions, we want to reset states
        dispatch(reset());

    },[user,success,error])
    //},[user,error,success])

    const onSubmit = (e) =>{
        e.preventDefault();

        if(password != passwordRepeat){
            toast.info("Password must be same",{
                className:"toast-contact-message"
            })
        }
        else{            
            //all state date append to data type variable 
            const formData = new FormData();
            for(const key in data){
                console.log("DATA: " + JSON.stringify(data))
                console.log(`${key}: ${data[key]}`)
                formData.append(key, data[key]);
            }
            //formData.append("picturePath", data['picture'].name);
            formData.append('type', 'Client');
            dispatch(register(formData));
            dispatch(reset())
        }
    }

    return (
        <ClientForm 
            data={data}
            city_options={city_options}
            options={profession_options} //interests
            onSubmit={onSubmit}
            onChange={onChange}
            onChangeCity={onChangeCity}
            onImageChange ={onImageChange}
            onChangeInterest={onChangeInterest}
        />
    )
}

export default ClientRegister;