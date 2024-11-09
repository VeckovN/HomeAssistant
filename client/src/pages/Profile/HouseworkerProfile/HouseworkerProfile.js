import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import HouseworkerProfileForm from './HouseworkerProfileForm';
import {profession_options} from '../../../utils/options';
import {getUserData, getProfessions, updateHouseworker} from '../../../services/houseworker.js';
import {useForm, useController} from 'react-hook-form';
import { getErrorMessage } from '../../../utils/ErrorUtils.js';

const HouseworkerProfile = () =>{

    const initalStateForm = {
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        city:'',
        address:'',
        phone_number:'',
        description:''
    }

    const {register, handleSubmit, watch,reset, control, formState: {errors, isSubmitSuccessful}} = useForm({
        defaultValues: initalStateForm
    })
    const {field:cityField} = useController({name:"city", control});
    const {field:avatarField} = useController({name:"avatar", control});
    const [houseworkerData, setHouseworkerData] = useState({}) //fetched (showned) data
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        fetchData();
    }, [])

    useEffect(()=>{
        reset({...initalStateForm})
    },[isSubmitSuccessful])

    const getNotOwnedProfessions = (houseworker_professions) =>{
        const profession_format = houseworker_professions?.map(el =>({value: el.profession, label: el.profession + " " + el.working_hour +'€'}))
        const professions = profession_options.filter((option) =>{
            //return only not same object
            return !profession_format.some((mine) => mine.value === option.value)
        })
        return {professions, profession_format};
    }

    const fetchData = async() =>{
        const houseworkerResult = await getUserData();
        const houseworker_professions = await getProfessions(); //from users

        const {professions:not_owned_professions, profession_format } = getNotOwnedProfessions(houseworker_professions);
        const newHouseworker = {...houseworkerResult, professions:[...profession_format], not_owned_professions:[...not_owned_professions]}

        setHouseworkerData(newHouseworker);
        setLoading(false);
    }

    const onSubmitUpdate = async (submitData)=>{
        try{
            let newData = {};
            Object.keys(submitData).forEach(key =>{
                if(submitData[key] != '' && submitData[key] !=undefined){ //undefined for avatar(file)
                    //data object wiht only updated props (for HTTP request)
                    newData[key] = submitData[key];
                }
            })

            if(Object.keys(newData).length == 0){
                toast.error("You didn't enter any value",{
                    className:'toast-contact-message'
                })
                return;
            }

            await updateHouseworker(newData);
            toast.success("Successfully updated")

            Object.keys(newData).forEach(key =>{
                setHouseworkerData(prev =>({
                    ...prev,
                    [key] : newData[key]  //BECAUSE 'key' is STRING and MUST use [] 
                }))
            })
        }
        catch(err){
            const error = getErrorMessage(err);
            const errorMessage = error.messageError || "Please try again later";
            toast.error(`Failed to update the profile. ${errorMessage}`, {
                className: 'toast-contact-message'
            });
            console.error(error);
        }
    }

    const onChangeCityHandler = (option) =>{
        if(option !== null)
            cityField.onChange(option.value);
        else
            cityField.onChange("");
    }

    const onChangeAvatarHandler = (event) =>{
        avatarField.onChange(event.target.files[0]);
    }
    
    const onRemoveAvatarHandler = (event) =>{
        event.preventDefault();
        avatarField.onChange(null);
    }

    return(
        <HouseworkerProfileForm 
            loading={loading}
            register={register}
            errors={errors}
            watch={watch}
            cityField={cityField}
            avatarField={avatarField}
            onChangeCityHandler={onChangeCityHandler}
            onChangeAvatarHandler={onChangeAvatarHandler}
            onRemoveAvatarHandler={onRemoveAvatarHandler}
            handleSubmit={handleSubmit}
            onSubmitUpdate={onSubmitUpdate}
            houseworkerData={houseworkerData}
            setHouseworkerData={setHouseworkerData}
            getNotOwnedProfessions={getNotOwnedProfessions}
        />
    )
}

export default HouseworkerProfile;