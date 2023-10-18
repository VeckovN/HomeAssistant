import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import useUser from '../../../../hooks/useUser';
import HouseworkerProfileForm from './HouseworkerProfileForm';
import {profession_options} from '../../../../utils/options';
import {getUserData, getProfessions, addProfession, deleteProfession, updateHouseworker, updateProfessionWorkingHour} from '../../../../services/houseworker.js';
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
    }

    const initialState = {
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        city:'',
        address:'',
        phone_number:'',
        profession:'', //selected profession from select
        working_hour:'',
        professions:[], //fetched houseowrker professions
        not_owned_professions:[],
        houseworker_professions:[] //adding new profession
    }

    //for professions part
    const initialProfessionsState = {
        // email:'',
        // password:'',
        // passwordRepeat:'',
        // first_name:'',
        // last_name:'',
        // city:'',
        // address:'',
        // phone_number:'',
        profession:'', //selected profession from select
        working_hour:'',
        professions:[], //fetched houseowrker professions
        not_owned_professions:[],
        houseworker_professions:[] //adding new profession
    }
    const {register, handleSubmit, watch,reset, getValues, control, formState: {errors, isSubmitSuccessful}} = useForm({
        defaultValues: initalStateForm
    })
    const {field:cityField} = useController({name:"city", control});



    //ForProfessions
    const {data:updatedData, onChange,onChangeWorkingHour, resetProfessions, onChangeProfession, onChangeHouseworkerProfessions, onChangeProffesions, onChangeCity} = useUser(initialState)
    const [houseworkerData, setHouseworkerData] = useState({}) //fetched (showned) data

    useEffect(()=>{
        fetchData();
    }, [])

    useEffect(()=>{
        reset({...initalStateForm})
    },[isSubmitSuccessful])

    const getNotOwnedProfessions = (houseworker_professions) =>{
        const profession_format = houseworker_professions?.map(el =>({value: el.profession, label: el.profession + " " + el.working_hour +'din'}))
        const professions = profession_options.filter((option) =>{
            //return only not same object
            return !profession_format.some((mine) => mine.value === option.value)
        })
        return {professions, profession_format};
    }

    const format_houseworker_label = (value, working_hour) =>{
        return {value:value, label: `${value} ${working_hour}din`}
    }

    const fetchData = async() =>{
        const houseworkerResult = await getUserData();
        const houseworker_professions = await getProfessions(); //from users

        const {professions:not_owned_professions, profession_format } = getNotOwnedProfessions(houseworker_professions);
        const newHouseworker = {...houseworkerResult, professions:[...profession_format], not_owned_professions:[...not_owned_professions]}

        setHouseworkerData(newHouseworker);
    }


    // const onSubmitUpdate = async (e)=>{
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
                
                    console.log("SDSDASD: " + JSON.stringify(houseworkerData));
                    console.log("DATAAAA: " + JSON.stringify(newData));
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

    const onChangeProfessionHandler = async(e) =>{
        //without that this button function will re-triger form onSubmit
        e.preventDefault();
        try{
            if(updatedData.profession){
                if(updatedData.working_hour){
                    const result = await updateProfessionWorkingHour(updatedData.profession, updatedData.working_hour)
                    const newProfessionOptions = houseworkerData.professions.map(el =>{
                        if(el.value === updatedData.profession)
                            el.label = updatedData.profession + " " + updatedData.working_hour + "€"
                        return el;
                    })
                    setHouseworkerData(prev =>({
                        ...prev,
                        ['professions']:newProfessionOptions
                    }))
                    toast.success("Successfully profession updated")
                }
                else
                    toast.error("Enter working hour ")
                
                return;
            }
        }
        catch(err){
            console.log("Error: " + err);
            toast.error("ERROR: You can't change the profession")
        }
    }
    
    const onAddProfessionHandler = async(e) =>{
        e.preventDefault();
        try{
            if(updatedData.houseworker_professions.length > 1){
                console.log("OLD : " + JSON.stringify(houseworkerData.professions) + "\n");
                let new_houseworker_professions = [];

                //We need array of promise because we have loop there fucntion should call as async
                const addProfessionPromises = updatedData.houseworker_professions.map(async (profession) => {
                    await addProfession(profession.label, profession.working_hour);
                    const new_profession = format_houseworker_label(profession.label, profession.working_hour);
                    new_houseworker_professions.push(new_profession);
                })
                //Wait for all promises to resolve using Promise.all
                await Promise.all(addProfessionPromises);

                // for Choosing current user profeesions
                const merged_houseworkers = [...houseworkerData.professions, ...new_houseworker_professions];

                const remained_professions = profession_options.filter((option) =>{
                    //return only not same object
                    return !merged_houseworkers.some((mine) => mine.value === option.value)
                })
                
                setHouseworkerData(prev => (
                    {
                        ...prev,
                        professions:merged_houseworkers,
                        not_owned_professions:remained_professions,
                        profession:'' //reset select view
                    }
                ))

                toast.success("Successfully professions added");
            }
            else{
                const label = updatedData.houseworker_professions[0].label;
                const working_hour = updatedData.houseworker_professions[0].working_hour;
                await addProfession(label, working_hour);

                const new_houseworker_professions = [... houseworkerData.professions] 
                const new_profession = format_houseworker_label(label, working_hour);
                new_houseworker_professions.push(new_profession);

                const remained_professions = houseworkerData.not_owned_professions.filter(el => el.value != label) 
                setHouseworkerData(prev => (
                    {
                        ...prev,
                        professions:new_houseworker_professions,
                        not_owned_professions:remained_professions,
                        profession:'', //reset select view
                    }
                ))
                toast.success("Profession successfully added");
            }     
            resetProfessions();
        }
        catch(err){
            console.log("Error: " + err);
            toast.error("ERROR: You can't add the profession")
        }
    }

    const onDeleteProfessionHandler = async(e, profession) =>{
        e.preventDefault();
        try{
            const result = await deleteProfession(profession);
            const houseworker_professions = result.data;
            //returned list of remaining professions
            const {professions:not_owned_professions, profession_format } = getNotOwnedProfessions(houseworker_professions);

            setHouseworkerData(prev =>({
                ...prev,
                professions:profession_format,
                profession:" ", //resent select 
                not_owned_professions:not_owned_professions //change Add Profession optiosn(add deleted profession)
            }))

            onChangeProfession(null);         
            toast.success("Profession Successfuly deleted")
        }
        catch(err){
            console.log("Error: " + err);
            toast.error("ERROR: You can't delete the profeesion")
        }   
    }

    const onChangeCityHandler = (option) =>{
        console.log("cityField: ", cityField);
        cityField.onChange(option.value);
    }

    return(
        <HouseworkerProfileForm 
            register={register}
            errors={errors}
            watch={watch}
            cityField={cityField}
            onChangeCityHandler={onChangeCityHandler}
            handleSubmit={handleSubmit}
            onSubmitUpdate={onSubmitUpdate}
            updatedData={updatedData}
            houseworkerData={houseworkerData}
            onChangeWorkingHour={onChangeWorkingHour}
            onChangeProfession={onChangeProfession}
            onChangeProffesions={onChangeProffesions}
            onChangeHouseworkerProfessions={onChangeHouseworkerProfessions}
            onChangeProfessionHandler={onChangeProfessionHandler}
            onAddProfessionHandler={onAddProfessionHandler}
            onDeleteProfessionHandler={onDeleteProfessionHandler}
            getNotOwnedProfessions={getNotOwnedProfessions}
        />
    )
}

export default HouseworkerProfile;