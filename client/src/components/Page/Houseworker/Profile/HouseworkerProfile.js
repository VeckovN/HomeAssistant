import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import useUser from '../../../../hooks/useUser';
import HouseworkerProfileForm from './HouseworkerProfileForm';
import {profession_options} from '../../../../utils/options';
import {getUserData, getProfessions, addProfession, deleteProfession, updateHouseworker, updateProfessionWorkingHour} from '../../../../services/houseworker.js';

import '../../../Page/Profile.css';

const HouseworkerProfile = () =>{//or prop.username
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

    const {data:updatedData, onChange, onChangeProfession, onChangeHouseworkerProfessions, onChangeProffesions, onChangeCity} = useUser(initialState)
    const [houseworkerData, setHouseworkerData] = useState({})

    useEffect(()=>{
        fetchData();
    }, [])

    const getNotOwnedProfessions = (houseworker_professions) =>{
        const profession_format = houseworker_professions?.map(el =>({value: el.profession, label: el.profession + " " + el.working_hour +'din'}))
        
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
    }


    const onSubmitUpdate = async (e)=>{
        e.preventDefault();

        if(updatedData.password != updatedData.passwordRepeat)
            toast.error("Password should be same")
        else if(updatedData.first_name == "" && updatedData.last_name =="" && updatedData.email =="" && updatedData.city =="" && updatedData.address =="" && updatedData.phone_number =="" && updatedData.password =="" && updatedData.passwordRepeat =="" && updatedData.profession =="") 
            toast.error("Enter values");
        else{
            try{
                let newData = {};
                //without re-fetching just override ClientData with updatedData
                Object.keys(updatedData).forEach((key,index) =>{
                    console.log("UPD: " + typeof(key)+ " : " + updatedData[key]);
                    
                    //picture wont store in this object(for it use diferent request)
                    if(updatedData[key] != '' && key!='picture' && key!='profession' && key!='working_hour'){
                        console.log("K " + key);
                        //data object wiht only updated props (for HTTP request)
                        newData[key] = updatedData[key];
                        
                        //not update here, update only when is post request sucessfully executed
                        setHouseworkerData(prev =>({
                            ...prev,
                            //BECAUSE 'key' is STRING and MUST use []  
                            [key] : updatedData[key] 
                        }))
                        console.log("SDSDASD: " + JSON.stringify(houseworkerData));
                        console.log("DATAAAA: " + JSON.stringify(newData));
                    }
                })
                // if(updatedData.picture !=''){
                //     await axios.put(`http://localhost:5000/api/clients/updateImage/`, updateImage);
                // }
    
                await updateHouseworker(newData);
                toast.success("Successfully updated")
            }
            catch(err){
                console.log("Erorr: " + err);
                toast.error("Error updated")
            }
        }
    }

    const onChangeProfessionHandler = async(e) =>{
        //without that this button function will re-triger form onSubmit
        e.preventDefault();
        try{
            if(updatedData.profession){
                if(updatedData.working_hour){
                    const result = await updateProfessionWorkingHour(updatedData.profession, updatedData.working_hour)
                    // const newProfessionOptions = professionOptions.map(el =>{
                        //existtting houseworker profession = houseworkerData.professions
                    const newProfessionOptions = houseworkerData.professions.map(el =>{
                        if(el.value === updatedData.profession)
                            el.label = updatedData.profession + " " + updatedData.working_hour + "din"

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
            // //if there is more then 1 profession
            if(updatedData.houseworker_professions.length > 1){
                //We need array of promise because we have loop there fucntion should call as async
                const addProfessionPromises = updatedData.houseworker_professions.map(async (profession) => {
                    await addProfession(profession.label, profession.working_hour);
                })

                //Wait for all promises to resolve using Promise.all
                await Promise.all(addProfessionPromises);
            }
            else{
                const label = updatedData.houseworker_professions[0].label;
                const working_hour = updatedData.houseworker_professions[0].working_hour;
                await addProfession(label, working_hour);
            }            
        }
        catch(err){
            console.log("Error: " + err);
            toast.error("ERROR: You can't add the profession")
        }
    }

    const onDeleteProfessionHandler = async(e, profession) =>{
        e.preventDefault();
        try{
            alert("PROFESS BEFORE : " + JSON.stringify(houseworkerData.professions)  + "\n"  + "PRES: " + profession);
            const result = await deleteProfession(profession);
            const houseworker_professions = result.data;

            alert("PROFESS AFTER : " + JSON.stringify(houseworker_professions));
            //returned list of remaining professions
            const {professions:not_owned_professions, profession_format } = getNotOwnedProfessions(houseworker_professions);
    
            alert("FINAL : " + JSON.stringify(profession_format));

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

    return(
        <HouseworkerProfileForm 
            updatedData={updatedData}
            houseworkerData={houseworkerData}
            // profession_options={professionOptions}
            onSubmitUpdate={onSubmitUpdate}
            onChange={onChange}
            onChangeProfession={onChangeProfession}
            onChangeCity={onChangeCity}
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