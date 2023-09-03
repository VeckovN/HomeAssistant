import {useState, useEffect, useCallback, useMemo} from 'react';
import {toast} from 'react-toastify';
import useUser from '../../../../hooks/useUser';
import HouseworkerProfileForm from './HouseworkerProfileForm';
import {profession_options} from '../../../../utils/options';
import {getUserData, getProfessions, addProfession, updateHouseworker, updateProfessionWorkingHour} from '../../../../services/houseworker.js';

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
        professions:[], //houseowrker professions
        not_owned_professions:[],
        houseworker_professions:[] //adding new profession
    }

    const {data:updatedData, onChange, onChangeHouseworkerProfession, onChangeHouseworkerProfessions, onChangeProffesions, onChangeCity} = useUser(initialState)
    const [houseworkerData, setHouseworkerData] = useState({})

    useEffect(()=>{
        fetchData();
    }, [])

    const fetchData = async() =>{
        const houseworkerResult = await getUserData();
        const houseworker_professions = await getProfessions(); //from users

        const profession_format = houseworker_professions?.map(el =>({value: el.profession, label: el.profession + " " + el.working_hour +'din'}))
        const notProfessions = profession_options.filter((option) =>{
            //return only not same object
            return !profession_format.some((mine) => mine.value === option.value)
        })
        const newHouseworker = {...houseworkerResult, professions:[...profession_format], not_owned_professions:[...notProfessions]}
        
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
    
    const onAddProfessionHandler = async() =>{
        try{
            // //if there is more then 1 profession
            // // updatedData.houseworker_professions.forEach(profession =>{
            // //     await addProfession(profession.label, profession.working)
            // // })

            // //if there is more then 1 professio
            if(updatedData.houseworker_professions.length > 1){
                //We need array of promise because we have loop there fucntion should call as async
                const addProfessionPromises = updatedData.houseworker_professions.map(async (profession) => {
                    await addProfession(profession.label, profession.working);
                })

                //Wait for all promises to resolve using Promise.all
                await Promise.all(addProfessionPromises);
            }
            else{
                const label = updatedData.houseworker_professions[0].label;
                const working_hour = updatedData.houseworker_professions[0].working_hour;
                alert(" V: " + label + " w: " + working_hour);
                await addProfession(label, working_hour);
            }            
            
        }
        catch(err){
            console.log("Error: " + err);
            
        }
    }

    return(
        <HouseworkerProfileForm 
            updatedData={updatedData}
            houseworkerData={houseworkerData}
            // profession_options={professionOptions}
            onSubmitUpdate={onSubmitUpdate}
            onChange={onChange}
            onChangeProfession={onChangeHouseworkerProfession}
            onChangeCity={onChangeCity}
            onChangeProffesions={onChangeProffesions}
            onChangeHouseworkerProfessions={onChangeHouseworkerProfessions}
            onAddProfessionHandler={onAddProfessionHandler}
        />
    )
}

export default HouseworkerProfile;