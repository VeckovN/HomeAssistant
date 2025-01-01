import {useState} from 'react';
import {useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'; //need be imported in App.js
import { city_options, profession_options } from '../../../utils/options';
import {useForm, useController} from 'react-hook-form'
import {zodResolver} from "@hookform/resolvers/zod";
import {clientRegisterSchema } from '../../../library/zodTypes.js';
import ClientForm from './ClientForm.js';
import {registerService} from '../../../services/auth.js';

const ClientRegister = () =>{
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
        resolver: zodResolver(clientRegisterSchema)
    })
    const {field:cityField} = useController({name:"city", control});
    const {field:avatarField} = useController({name:"avatar", control});
    const {field:interestField} = useController({name:"interests", control});

    const onSubmitHandler = async (data) =>{
        const formData = new FormData();
        for(const key in data){
            formData.append(key, data[key]);
        }

        formData.append('type', 'Client');

        setLoading(true);
        try{
            await registerService(formData);
            navigate('/login');
            toast.success("You have successfully created account",{
                className:'toast-contact-message'
            })
        }
        catch(error){
            console.error(error);
        }
        finally{
            setLoading(false);
        }
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
            loading={loading}
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