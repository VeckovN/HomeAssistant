import {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {register, reset} from '../../../../store/auth-slice';
import useUser from '../../../../hooks/useUser.js'
import {toast} from 'react-toastify';
import HouseworkerForm from './HouseworkerForm';
import { city_options, profession_options } from '../../../../utils/options';

import '../Register.css';

const HouseworkerRegister = () =>{

    const initialState ={
        username:'',
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        age:'',
        picture:'',
        gender:'',
        city:'',
        address:'',
        description:'',
        phone_number:'',
        professions:[],
    }
    
    const {data, onChangeHouseworker, onChangeCity, onImageChange, onChangeProffesions} = useUser(initialState);
    const { password, passwordRepeat} = data;
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {user, loading, success, error, message} = useSelector( (state) => state.auth)

    useEffect( ()=>{
        //on every user,success,error,message state change chech status of states
        //and show the appropriate notification
        if(error)
            toast.error(message);
        
        //register.fulfilled trigger success=true (when is register success )
        //or if user is logged (after register) 
        if(success || user){
            navigate('/');
            toast.success(message);
        }
        //after all of this actions, we want to reset states
        dispatch(reset());

    },[user, success,error, message, navigate, dispatch])

    console.log("DATA: " + JSON.stringify(data));
    
    const onSubmit = (e) =>{
        e.preventDefault();

        if(password != passwordRepeat){
            alert("Passwords ins't same");
        }
        else{            
            const formData = new FormData();
            for(const key in data){
                console.log("DATA: " + JSON.stringify(data))
                console.log(`${key}: ${data[key]}`)
                formData.append(key, data[key]);         
            }
            formData.append('type', 'Houseworker');
            dispatch(register(formData));
        }
    }

    return (
        <HouseworkerForm
            data={data}
            city_options={city_options}
            profession_options={profession_options}
            onSubmit={onSubmit}
            onChange={onChangeHouseworker}
            onChangeCity={onChangeCity}
            onImageChange={onImageChange}
            onChangeProffesions={onChangeProffesions}
        />
    )

}

export default HouseworkerRegister