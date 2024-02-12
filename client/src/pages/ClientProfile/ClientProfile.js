import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import ClientProfileForm from './ClientProfileForm';
import {getUserData, updateClient} from '../../services/client.js';
import {useForm, useController} from 'react-hook-form';
import { city_options } from '../../utils/options.js';

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
        //restaring entered input value
        // const values = {...watch()}
        // const resetElements = Object.keys(values).filter(key => values[key])
        // const resetObj = Object.fromEntries(resetElements.map(el => [el, ""]));
        //reset({...resetObj})
        reset({...initialState})
    },[isSubmitSuccessful])

    const fetchData = async() =>{
        const clientData = await getUserData();
        setClientData(clientData);
        setLoading(false);
    }

    const onSubmitUpdate = async(updatedData) =>{
        try{
            //only props wiht updated data( !='') for HTTP request
            let newData = {};
            //without re-fetching just override ClientData with updatedData
            Object.keys(updatedData).forEach(key =>{
                //console.log("UPD: " + typeof(key)+ " : " + updatedData[key]);
                //picture wont store in this object(for it use diferent request)
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

            // if(updatedData.picture !=''){
            //     await axios.put(`http://localhost:5000/api/clients/updateImage/`, updateImage);
            // }

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
            //sent through return res.status(400).json({error:"User with this email exists"})
            //catch it with err.response.data.error (error is prop of data-obj in json : "User with this email exists")
            const message = (err.response && err.response.data.error) || err.message || err
            toast.error(message);
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