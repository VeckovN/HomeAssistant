import {useEffect, useState, useMemo, useRef, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'; //need be imported in App.js
import {register as clientRegister, reset} from '../../../../store/auth-slice'
import useUser from '../../../../hooks/useUser.js'
import ClientForm from './ClientForm';
import { city_options, profession_options } from '../../../../utils/options';
import Select from 'react-select';
import {useForm, useController} from 'react-hook-form'
import {zodResolver} from "@hookform/resolvers/zod";
// import { string, z, array} from "zod"; 
import { clientRegisterSchema } from '../../../../lib/zodTypes';

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
    const initialStateN ={
        username:'',
        email:'',
        password:'',
        confirmPassword:'',
        firstName:'',
        lastName:'',
        avatar:'',
        city:'',
        gender:'',
        interests:[]
    }

    const {register, handleSubmit, control, formState: {errors, isSubmitting}, getValues} = useForm({
        defaultValues: initialStateN,
        // defaultValues: initialStateN, 
        resolver: zodResolver(clientRegisterSchema)
    })
    const {field:cityField} = useController({name:"city", control});
    const {field:avatarField} = useController({name:"avatar", control});
    const {field:interestField} = useController({name:"interests", control});


    // const {data, onChange, onChangeCity, onImageChange, onChangeInterest} = useUser(initialState);
    //const {user, message, error, success} = useSelector((state) => state.auth)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    //functions will be only re-created when is user state changed
    // const onSomething = useCallback( () =>{

    // },[user])

    //checking if the function is the same
    //const oldFunc = useRef();
    // useEffect( () =>{
    //     //render - at first time
    //     console.log("AT FIRST TIME RENDER")
    //     oldFunc.current = onChangeInterest;
    // },[])

    // // const oldFunction = onChangeInterest;
    // if(oldFunc.current === onChangeInterest)
    //     console.log("SAME FUNCTION");
    // else
    //     console.log("NEW CREATED FUNCTION");

    //set spinner when is loading true
    // if(loading){
    //     return <Spiner></Spiner>
    // }

    const onSubmitHandler = (data) =>{
        console.log("Form DATA: \n " + JSON.stringify(data) )

        const formData = new FormData();
        for(const key in data){
            //console.log("DATA: " + JSON.stringify(data))
            //console.log(`${key}: ${data[key]}`)
            formData.append(key, data[key]);
        }
        formData.append('type', 'Client');
        // for (const [key, value] of formData.entries()) {
        //     console.log(`${key}: ${value}`);
        // }

        dispatch(clientRegister(formData));
        navigate('/login');
        toast.success("You have successfully created account",{
            className:'toast-contact-message'
        })

    }

    const onCityChangeHandler = (option) =>{
        console.log("field", cityField);
        cityField.onChange(option.value);
    }

    const onImageChangeHandler = (event) =>{
        avatarField.onChange(event.target.files[0]);
        console.log("avatarField: ", avatarField)
    }

    const onChangeInterestHandler = (event) =>{
        let professionsArray;
        professionsArray = Array.isArray(event) ? event.map(p => p.value): []; 
        interestField.onChange(professionsArray);
    }

    const onSubmit =(e) =>{
        e.preventDefault();

        // if(password != passwordRepeat){
        if(data.password != data.passwordRepeat){
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
            formData.append('type', 'Client');

            console.log("FORM DATA: " + JSON.stringify(formData));

            dispatch(clientRegister(formData));
        }

        navigate('/');
        toast.success("You have successfully created account",{
            className:'toast-contact-message'
        })
    }



    return (
        <div className='register_container'>
            <form onSubmit={handleSubmit(onSubmitHandler)} encType="multipart/form-data">
            <div className='form_title'>Client Registration</div>
                <div className='register_input_container'>
                    <input
                        className='input_field'
                        type='text'
                        placeholder='Enter username'
                        {...register('username')} //it's return ("username", onChange, onBlur and ref props )
                        // name='username'
                        // value={data.username}
                        // onChange={onChange}
                    />
                    <div className='input_errors'>{errors.username?.message}</div>
                </div>

                <div className='register_input_container'>
                    <input
                        className='input_field'
                        type='password'
                        placeholder='Enter password'
                        {...register('password')}
                    />
                    <div className='input_errors'>{errors.password?.message}</div>
                </div>

                <div className='register_input_container'>
                    <input
                        className='input_field'
                        type='password'
                        placeholder='Repeat password'
                        {...register('confirmPassword')}
                    />
                    <div className='input_errors'>{errors.confirmPassword?.message}</div>
                </div>

                <div className='register_input_container'>
                    <input
                        className='email'
                        type='email'
                        placeholder='Enter email address'
                        {...register('email')}
                    />
                    <div className='input_errors'>{errors.email?.message}</div>
                </div>

                <div className='register_input_container'>
                    <input
                        className='input_field'
                        type='text'
                        placeholder='Enter first name'
                        // name='first_name'
                        {...register('firstName')}
                    />
                    <div className='input_errors'>{errors.firstName?.message}</div>
                </div>

                <div className='register_input_container'>
                    <input
                        className='input_field'
                        type='text'
                        placeholder='Enter last name'
                        //name='last_name'
                        {...register('lastName')}
                    />
                    <div className='input_errors'>{errors.lastName?.message}</div>
                </div>

                <br></br>
                {/* //controler will be used here because the onChangeCity takes event.value -> not event.target.value as onChange */}
                <Select 
                    // className='dropdown'
                    // placeholder="Select a city"
                    // options={city_options}
                    // onChange={onChangeCity}
                    value={city_options.find(({value}) => value === cityField.value)}
                    options={city_options}
                    onChange={onCityChangeHandler}
                    isClearable
                />
                <div className='input_errors'>{errors.city?.message}</div>

                <label className='label_input'>Gender</label>
                <select className="gender_option" {...register('gender')}>
                    <option value="">Choose gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <div className='input_errors'>{errors.gender?.message}</div>

                <label>Profile Avatar</label>
                <div className='form-group form-group-image'>
                    <input 
                        className ='inputFile' 
                        type="file" 
                        //name="picture" />
                        onChange={onImageChangeHandler}   
                    />
                    <div className='input_errors'>{errors.avatar?.message}</div>
                </div>
                

                <label className='label_input'>Interests</label>
                <Select 
                    className='dropdown'
                    placeholder="Select the professions that interest you"
                    options={profession_options}
                    onChange={onChangeInterestHandler}
                    value={profession_options.find(({value}) => value === interestField.value)}
                    isMulti
                    isClearable
                />
                <div className='input_errors'>{errors.interests?.message}</div>

                <div className ='register_button_container'>
                    <button type='submit' className='btn'>Register</button>
                </div>

            </form>
        </div>
    )
}

export default ClientRegister;