import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import HouseworkerProfileForm from './HouseworkerProfileForm';
import {profession_options} from '../../../../utils/options';
import {getUserData, getProfessions, updateHouseworker} from '../../../../services/houseworker.js';
import {useForm, useController} from 'react-hook-form';
import '../../../Page/Profile.css';

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
        console.log("SUBMITED VALUE: " , submitData)
        try{
            let newData = {};
            Object.keys(submitData).forEach(key =>{
                //console.log("UPD: " + typeof(key)+ " : " + updatedData[key]);
                //picture wont store in this object(for it use diferent request)
                if(submitData[key] != '' && key!='picture' && key!='profession' && key!='working_hour'){
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
            
            // if(updatedData.picture !=''){
            //     await axios.put(`http://localhost:5000/api/clients/updateImage/`, updateImage);
            // }

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
            const message = (err.response && err.response.data.error) || err.message || err
            toast.error(message);
        }
    }

    const onChangeCityHandler = (option) =>{
        console.log("cityField: ", cityField);
        cityField.onChange(option.value);
    }

    return(
        <HouseworkerProfileForm 
            loading={loading}
            register={register}
            errors={errors}
            watch={watch}
            cityField={cityField}
            onChangeCityHandler={onChangeCityHandler}
            handleSubmit={handleSubmit}
            onSubmitUpdate={onSubmitUpdate}
            houseworkerData={houseworkerData}
            setHouseworkerData={setHouseworkerData}
            getNotOwnedProfessions={getNotOwnedProfessions}
        />
    )
}

export default HouseworkerProfile;