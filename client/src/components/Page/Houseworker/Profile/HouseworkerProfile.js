import {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import useUser from '../../../../hooks/useUser';
import HouseworkerProfileForm from './HouseworkerProfileForm';
import {getUserData, getProfessions, updateHouseworker, updateProfessionWorkingHour} from '../../../../services/houseworker.js';

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
    }

    const {data:updatedData, onChange, onChangeHouseworkerProfession, onChangeCity} = useUser(initialState)
    const [houseworkerData, setHouseworkerData] = useState({})
    const [professionOptions, setProfessionOptions] = useState([]);

    useEffect(()=>{
        fetchData();
    }, [])

    const fetchData = async() =>{
        const houseworkerResult = await getUserData();
        const professions = await getProfessions();
        const profession_options = professions?.map(el =>({value: el.profession, label: el.profession + " " + el.working_hour +'din'}))

        setProfessionOptions(profession_options);
        setHouseworkerData(houseworkerResult);
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
                        const newProfessionOptions = professionOptions.map(el =>{
                            if(el.value === updatedData.profession)
                                el.label = updatedData.profession + " " + updatedData.working_hour + "din"

                            return el;
                        })
                        setProfessionOptions(newProfessionOptions);
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

    return(
        <HouseworkerProfileForm 
            updatedData={updatedData}
            houseworkerData={houseworkerData}
            profession_options={professionOptions}
            onSubmitUpdate={onSubmitUpdate}
            onChange={onChange}
            onChangeProfession={onChangeHouseworkerProfession}
            onChangeCity={onChangeCity}
        />
    )
}

export default HouseworkerProfile;