
import {useDispatch} from 'react-redux';
import {useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'; //need be imported in App.js
import {register as clientRegister} from '../../../../store/auth-slice'
import { city_options, profession_options } from '../../../../utils/options';
import {useForm, useController} from 'react-hook-form'
import {zodResolver} from "@hookform/resolvers/zod";
import {clientRegisterSchema } from '../../../../library/zodTypes.js';
import FormInput from '../../../../utils/FormInput';
import FormSelect from '../../../../utils/FormSelect';

// import '../Register.css'
import '../../../../sass/pages/Register/_registerUser.scss';


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
        console.log("Form DATA: \n " + JSON.stringify(data) )

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

    const inputs =[{id:'1', name:'username', type:'text'}, {id:'2', name:'email' , type:'text' ,autoComplete:'off'}, {id:'3',name:'password', type:'password', autoComplete:"new-password"},
     {id:'4',name:'confirmPassword', type:'password', autoComplete:"new-password"}, 
    {id:'5',name:'firstName' , type:'text', placeholder:"Enter first name"}, {id:'6',name:'lastName', type:'text', placeholder:"Enter last name"}]

    return (
        <div className='register-user-container'>
            <form onSubmit={handleSubmit(onSubmitHandler)} encType="multipart/form-data">
            <div className='form-title'>Client Registration</div>
                {inputs.map(el => {
                    return<div className='register-input-container' key={el.id}>
                        <FormInput 
                            type={el.type}
                            name={el.name}
                            placeholder={el.placeholder}
                            autoComplete={el.autoComplete}
                            register={register} 
                            errors={errors}
                        />
                    </div>
                })}                    

                <br></br>

                <FormSelect
                    placeholder="Select a city"
                    title="City"
                    options={city_options}
                    onChangeHandler={onCityChangeHandler}
                    formFieldValue={cityField.value}
                    errorsMessage={errors.city?.message}
                />

                <div className='gender-container'>
                    <label className='label-input'>Gender</label>
                    <select className="gender-option" {...register('gender')}>
                        <option value="">Choose gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <div className='input-error'>{errors.gender?.message}</div>
                </div>

                <div className='avatar-container'>
                    <label className='label-input'>Profile Avatar</label>
                    <div className='form-group form-group-image'>
                        <input 
                            className ='inputFile' 
                            type="file" 
                            //name="picture" />
                            onChange={onImageChangeHandler}   
                        />
                        <div className='input-error'>{errors.avatar?.message}</div>
                    </div>
                </div>

                <FormSelect
                    placeholder="Select the professions that interest you"
                    title="Interests"
                    options={profession_options}
                    onChangeHandler={onChangeInterestHandler}
                    formFieldValue={interestField.value}
                    errorsMessage={errors.interests?.message}
                    isMulti
                />

                <div className ='register-button-container'>
                    <button type='submit' className='btn'>Register</button>
                </div>

            </form>
        </div>
    )
}

export default ClientRegister;