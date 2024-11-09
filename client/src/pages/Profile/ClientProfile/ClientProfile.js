import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import ClientProfileForm from './ClientProfileForm.js';
import {getUserData, updateClient} from '../../../services/client.js';
import {useForm, useController} from 'react-hook-form';
import {city_options} from '../../../utils/options.js';
import {getErrorMessage} from '../../../utils/ErrorUtils.js';

const ClientProfile = () =>{ 
    const initialState = {
        email:'',
        password:'',
        confirmRepeat:'',
        first_name:'',
        last_name:'',
        avatar:'',
        city:'',
    }

    const {register, handleSubmit, watch,reset, getValues, control, formState: {errors, isSubmitSuccessful}} = useForm({
        defaultValues: initialState
    })
    const {field:cityField} = useController({name:"city", control});
    const [clientData, setClientData] = useState({})
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        fetchData()
    }, [])

    useEffect( () =>{
        reset({...initialState})
    },[isSubmitSuccessful])

    const fetchData = async() =>{
        const clientData = await getUserData();
        setClientData(clientData);
        setLoading(false);
    }

    const onSubmitUpdate = async(updatedData) =>{
        try{
            let newData = {};
            //without re-fetching just override ClientData with updatedData
            Object.keys(updatedData).forEach(key =>{
                if(updatedData[key] != '' && key!='picture'){
                    newData[key] = updatedData[key];
                }
            })

            if(Object.keys(newData).length == 0){
                toast.error("You didn't enter any value",{
                    className:'toast-contact-message'
                })
                return;
            }

            await updateClient(newData);
            toast.success("Successfuly updated!")

            Object.keys(newData).forEach(key =>{
                setClientData(prev =>({
                    ...prev,
                    //BECAUSE 'key' is STRING and MUST use []  
                    [key] : newData[key] 
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

    const onCityChangeHandler = (option) =>{
        if(option !== null)
            cityField.onChange(option.value);
        else
            cityField.onChange("");
    }

    return(
        <ClientProfileForm 
            loading={loading}
            clientData={clientData}
            cityField={cityField}
            errors={errors}
            register={register}
            watch={watch} 
            city_options={city_options} 
            handleSubmit={handleSubmit}
            onSubmitUpdate={onSubmitUpdate}
            onCityChangeHandler={onCityChangeHandler}
        />
        
    )
}

export default ClientProfile;