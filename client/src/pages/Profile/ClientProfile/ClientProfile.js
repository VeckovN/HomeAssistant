import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import {handlerError} from '../../../utils/ErrorUtils.js';
import ClientProfileForm from './ClientProfileForm.js';
import {getUserData, updateClient} from '../../../services/client.js';
import {useForm, useController} from 'react-hook-form';
import {city_options} from '../../../utils/options.js';

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
    const {field:avatarField} = useController({name:"avatar", control});
    const [clientData, setClientData] = useState({})
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        fetchData()
    }, [])

    useEffect( () =>{
        reset({...initialState})
    },[isSubmitSuccessful])

    const fetchData = async() =>{
        try{
            const clientData = await getUserData();
            setClientData(clientData);
            setLoading(false);
        }
        catch(err){
            handlerError(err);
        }
    }

    const onSubmitUpdate = async(updatedData) =>{
        try{
            console.log("UpdateData:" , updatedData);        
            const formData = new FormData();
            let newData = {};
            console.log("OBject>etnries: ", Object.entries(updatedData));

            Object.entries(updatedData).forEach(([key, value]) => {
                if (value !== '' && value !== undefined) {
                    formData.append(key, value);
                    newData[key] = value;
                }
            });
        
            const avatarFile = watch('avatar');  // Assuming you're using react-hook-form
            console.log("avatart File watch: ", avatarFile);
            console.log("avatarFile[0]: ", avatarFile[0]);
            if (avatarFile) {
                // formData.append('file', avatarFile[0]);  // Appending file to FormData
                formData.append('file', avatarFile);  // Appending file to FormData
                newData['file'] = avatarFile;
            }
        

            if(Object.keys(newData).length == 0){
                toast.error("You didn't enter any value",{
                    className:'toast-contact-message'
                })
                return;
            }

            for (let [key, value] of formData.entries()) {
                console.log(`\nFORM ${key}: ${value} `);
            }
            console.log("\n NewData: ", newData);

            // await updateClient(newData);
            await updateClient(formData);
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
            handlerError(err);
        }
    }

    const onCityChangeHandler = (option) =>{
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
        <ClientProfileForm 
            loading={loading}
            clientData={clientData}
            cityField={cityField}
            avatarField={avatarField}
            errors={errors}
            register={register}
            watch={watch} 
            city_options={city_options} 
            handleSubmit={handleSubmit}
            onSubmitUpdate={onSubmitUpdate}
            onCityChangeHandler={onCityChangeHandler}
            onChangeAvatarHandler={onChangeAvatarHandler}
            onRemoveAvatarHandler={onRemoveAvatarHandler}
        />
        
    )
}

export default ClientProfile;