
import {useDispatch} from 'react-redux';
import {useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'; //need be imported in App.js
import {register as clientRegister} from '../../../store/auth-slice'
import { city_options, profession_options } from '../../../utils/options';
import {useForm, useController} from 'react-hook-form'
import {zodResolver} from "@hookform/resolvers/zod";
import {clientRegisterSchema } from '../../../library/zodTypes.js';
import ClientForm from './ClientForm.js';

const ClientRegister = () =>{
    const initialState ={
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
        defaultValues: initialState,
        // defaultValues: initialStateN, 
        resolver: zodResolver(clientRegisterSchema)
    })
    const {field:cityField} = useController({name:"city", control});
    const {field:avatarField} = useController({name:"avatar", control});
    const {field:interestField} = useController({name:"interests", control});

    const navigate = useNavigate();
    const dispatch = useDispatch();


    //set spinner when is loading true
    // if(loading){
    //     return <Spiner></Spiner>
    // }

    const onSubmitHandler = (data) =>{
        const formData = new FormData();
        for(const key in data){
            formData.append(key, data[key]);
        }
        formData.append('type', 'Client');

        dispatch(clientRegister(formData));
        navigate('/login');
        toast.success("You have successfully created account",{
            className:'toast-contact-message'
        })

    }

    const onCityChangeHandler = (option) =>{
        if(option !== null)
            cityField.onChange(option.value);
        else
            cityField.onChange("");
    }

    const onChangeImageHandler = (event) =>{
        avatarField.onChange(event.target.files[0]);
    }

    const onRemoveAvatarHanlder = (e) =>{
        e.preventDefault();
        avatarField.onChange(null);
    }

    const onChangeInterestHandler = (event) =>{
        let professionsArray;
        professionsArray = Array.isArray(event) ? event.map(p => p.value): []; 
        interestField.onChange(professionsArray);
    }

    return (
        <ClientForm
            register={register} 
            errors={errors}
            cityField={cityField}
            avatarField={avatarField}
            interestField={interestField}
            city_options={city_options}
            profession_options={profession_options}
            handleSubmit={handleSubmit}
            onSubmitHandler={onSubmitHandler}
            onChangeImageHandler={onChangeImageHandler}
            onCityChangeHandler={onCityChangeHandler}
            onRemoveAvatarHanlder={onRemoveAvatarHanlder}
            onChangeInterestHandler={onChangeInterestHandler}
        />
    )
}

export default ClientRegister;