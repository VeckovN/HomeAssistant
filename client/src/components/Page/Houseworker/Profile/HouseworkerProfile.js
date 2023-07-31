import {useState, useEffect} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';
import useUser from '../../../../hooks/useUser';
import HouseworkerProfileForm from './HouseworkerProfileForm';
import {getUserData, updateHouseworker} from '../../../../services/houseworker.js';

import '../../../Page/Profile.css';

const HouseworkerProfile = () =>{
    const initialState = {
        username:'',
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        city:'',
        address:'',
        phone_number:''
    }

    const {data:updatedData, onChange, onChangeCity} = useUser(initialState)
    const [houseworkerData, setHouseworkerData] = useState({})

    useEffect(()=>{
        fetchData();
    }, [])

    const fetchData = async() =>{
        // const result = await axios.get(`http://localhost:5000/api/houseworker/info`);
        // const houseworkerResult = result.data;
        const houseworkerResult = await getUserData();
        console.log("DATA : "  + JSON.stringify(houseworkerResult))
        setHouseworkerData(houseworkerResult);
    }


    const onSubmitUpdate = async (e)=>{
        e.preventDefault();

        if(updatedData.password != updatedData.passwordRepeat)
            toast.error("Password should be same")
        else if(updatedData.first_name == "" && updatedData.last_name =="" && updatedData.email =="" && updatedData.city =="" && updatedData.address =="" && updatedData.phone_number =="" && updatedData.password =="" && updatedData.passwordRepeat =="") 
            toast.error("Enter values");
        else{
            try{
                //only props wiht updated data( !='') for HTTP request
                let newData = {};
                //without re-fetching just override ClientData with updatedData
                Object.keys(updatedData).forEach((key,index) =>{
                    console.log("UPD: " + typeof(key)+ " : " + updatedData[key]);
                    
                    //picture wont store in this object(for it use diferent request)
                    if(updatedData[key] != '' && key!='picture'){
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

    return(
        <HouseworkerProfileForm 
            updatedData={updatedData}
            houseworkerData={houseworkerData}
            onSubmitUpdate={onSubmitUpdate}
            onChange={onChange}
            onChangeCity={onChangeCity}
        />
    )
}

export default HouseworkerProfile;