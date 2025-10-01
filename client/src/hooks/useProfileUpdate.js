import {useState, useEffect} from 'react';
import {useForm, useController} from 'react-hook-form';
import { toast } from 'react-toastify';
import { handlerError } from '../utils/ErrorUtils';

const useProfileUpdate = ({
    initialState,
    fetchUserData,
    updateUserData,
}) => {

    const {register, handleSubmit, watch,reset, getValues, control, formState: {errors, isSubmitSuccessful}} = useForm({
        defaultValues: initialState
    })
    const {field:cityField} = useController({name:"city", control});
    const {field:avatarField} = useController({name:"avatar", control});
    const [userData, setUserData] = useState({})
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        fetchData()
    }, [])

    useEffect( () =>{
        reset({...initialState})
    },[isSubmitSuccessful])

    const fetchData = async() =>{
        try{
            const userData = await fetchUserData();
            setUserData(userData);
            setLoading(false);
        }
        catch(err){
            handlerError(err);
        }
    }

    const onSubmitUpdate = async(updatedData) =>{
        try{     
            const formData = new FormData();
            let newData = {};

            Object.entries(updatedData).forEach(([key, value]) => {
                if (value !== '' && value !== undefined) {
                    if(key == 'avatar') return;

                    formData.append(key, value);
                    newData[key] = value;
                }
            });
        
            const avatarFile = watch('avatar');  // Assuming you're using react-hook-form
            if (avatarFile) {
                formData.append('avatar', avatarFile);
                newData['avatar'] = avatarFile;
            }
    

            if(Object.keys(newData).length == 0){
                toast.error("You didn't enter any value",{
                    className:'toast-contact-message'
                })
                return;
            }

            await updateUserData(formData);
            toast.success("Successfuly updated!")
            Object.keys(newData).forEach(key =>{
                setUserData(prev =>({
                    ...prev,
                    //'key' is STRING and MUST use []  
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

    return {
        register,
        handleSubmit,
        watch,
        errors,
        cityField,
        avatarField,
        userData,
        setUserData,
        loading,
        onSubmitUpdate,
        onCityChangeHandler,
        onChangeAvatarHandler,
        onRemoveAvatarHandler,
        fetchData
    }
}

export default useProfileUpdate;