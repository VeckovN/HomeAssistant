import { useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {register as registerHouseworker} from '../../../store/auth-slice';
import {toast} from 'react-toastify';
import HouseworkerForm from './HouseworkerForm';
import { city_options, profession_options } from '../../../utils/options';
import {useForm, useFieldArray ,useController} from 'react-hook-form'
import {zodResolver} from "@hookform/resolvers/zod";
import { houseworkerRegisterSchema } from '../../../library/zodTypes';

const HouseworkerRegister = () =>{
    const initialState ={
        username:'',
        email:'',
        firstName:'',
        lastName:'',
        password:'',
        confirmPassword:'',
        age:'',
        avatar:'',
        gender:'',
        city:'',
        address:'',
        description:'',
        phoneNumber:'',
        professions:[],
        houseworkerProfessions:[]  //[{label:"Cleaner" , working_hour:320} , { } , { }]
    }

    const {register, handleSubmit, control, formState: {errors}, getValues} = useForm({
        defaultValues: initialState,
        resolver: zodResolver(houseworkerRegisterSchema)
    })

    const {field:cityField} = useController({name:"city", control});
    const {field:avatarField} = useController({name:"avatar", control});
    const {field:professionField} = useController({name:"professions", control});
    //for every professionsField (selected) must exist object {label, workingHour}
    //houseworkerProfessionField should be [{label:"professionName" workingHour:"--"}, {labeel , workingHour} if other exists]
    const { fields:houseworkerProfessionsFields, append, remove } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: "houseworkerProfessions", // unique name for your Field Array
      });
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onSubmitHandler = async (data,event ) =>{
        event.preventDefault();
        console.log("Form DATA: \n " + JSON.stringify(data))

        //check does profession working hours entered
        if(getValues('professions') && houseworkerProfessionsFields.length == 0){
            toast.error("You have to enter working hour for profession",{
                className:'toast-contact-message'
            })
            return;
        }

        const formData = new FormData();
        for(const key in data){
            if(key === 'houseworkerProfessions'){
                formData.append(key, JSON.stringify(getValues('houseworkerProfessions'))) 
            }
            else
                formData.append(key, data[key]);         
        }
        formData.append('type', 'Houseworker');

        // for (const [key, value] of formData.entries()) {        
        //     console.log(`${key}: ${value}`);
        // }

        dispatch(registerHouseworker(formData));
        navigate('/login');
        toast.success("You have successfully created account",{
            className:'toast-contact-message'
        })
    }

    const onChangeCityHandler = (option) =>{
        if(option !== null)
            cityField.onChange(option.value);
        else
            cityField.onChange("");
    }

    const onChangeImageHandler = (event) =>{
        avatarField.onChange(event.target.files[0]);
        console.log("avatarField", avatarField);
    }

    const onRemoveAvatarHanlder = (e) =>{
        e.preventDefault();
        avatarField.onChange(null);
    }

    const onChangeProffesionsHandler = (event) =>{
        let professionsArray;
        professionsArray = Array.isArray(event) ? event.map(p => p.value): [];
        professionField.onChange(professionsArray);
    }

    const onChangeHouseworkerProfessionsHandler = (event) =>{
        const {value, name} = event.target;

        const existingObjectIndex = getValues('houseworkerProfessions').findIndex(item => item.label === name)
        if(value === ""){
            if(existingObjectIndex !== -1)
                remove(existingObjectIndex);
        }
        else{
            if(existingObjectIndex == -1)
                append({label:name, working_hour:value});
        }
    }

    return (
        <HouseworkerForm
            register={register}
            errors={errors}
            getValues={getValues}
            cityField={cityField}
            professionField={professionField}
            avatarField={avatarField}
            onRemoveAvatarHanlder={onRemoveAvatarHanlder}
            handleSubmit={handleSubmit}
            onSubmitHandler={onSubmitHandler}
            onChangeHouseworkerProfessionsHandler={onChangeHouseworkerProfessionsHandler}
            onChangeProffesionsHandler={onChangeProffesionsHandler}
            onChangeImageHandler={onChangeImageHandler}
            onChangeCityHandler={onChangeCityHandler}
            profession_options={profession_options}
            city_options ={city_options}
        />
    )

}

export default HouseworkerRegister