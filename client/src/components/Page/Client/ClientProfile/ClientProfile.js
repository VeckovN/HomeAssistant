import {useState, useEffect} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';
import Select from 'react-select';
import useUser from '../../../../hooks/useUser';
import {city_options} from '../../../../utils/options.js';
import ClientProfileForm from './ClientProfileForm';
import {getUserData, updateClient} from '../../../../services/client.js';

import './ClientProfile.css'


//For user enterd value Validation use useState()
//for only taking value on submit(without validation) better choice is useRef
const ClientProfile = () =>{ 

    //updatedData
    const initialState = {
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        picture:'',
        city:'',
    }

    const {data:updatedData, onChange:onChangeUpdate, onChangeCity} = useUser(initialState);
    const [clientData, setClientData] = useState({})

    //setted value on fetch
    useEffect( ()=>{
        fetchData()
    }, [])

    const fetchData = async() =>{
        // const result = await axios.get(`http://localhost:5000/api/clients/info`)
        // const clientData = result.data;
        const clientData = await getUserData();
        console.log("DATA : "  + JSON.stringify(clientData))
        setClientData(clientData);
    }

    const onSubmitUpdate = async (e)=>{
        e.preventDefault();

        if(updatedData.password != updatedData.passwordRepeat)
            toast.error("Sifre nisu iste");
        else if(updatedData.first_name =="" && updatedData.last_name =="" && updatedData.email =="" && updatedData.city =="" && updatedData.password =="" && updatedData.passwordRepeat ==""){
            toast.error("Unesite podatke");
        }
        else{
            try{
                //only props wiht updated data( !='') for HTTP request
                let newData = {};
                //without re-fetching just override ClientData with updatedData
                Object.keys(updatedData).forEach((key,index) =>{
                    console.log("UPD: " + typeof(key)+ " : " + updatedData[key]);
                    
                    //picture wont store in this object(for it use diferent request)
                    if(updatedData[key] != '' && key!='picture'){
                        //data object wiht only updated props (for HTTP request)
                        newData[key] = updatedData[key];
                        
                        setClientData(prev =>({
                            ...prev,
                            //BECAUSE 'key' is STRING and MUST use []  
                            [key] : updatedData[key] 
                        }))
                    }
                })
    
                // if(updatedData.picture !=''){
                //     await axios.put(`http://localhost:5000/api/clients/updateImage/`, updateImage);
                // }
    
                await updateClient(newData);
                toast.success("Successfuly updated!")
            }
            catch(err){
                console.log("Erorr: " + err);
                toast.error("Error updated")
            }
        }
    }

    return(
        <ClientProfileForm 
            updatedData = {updatedData}
            clientData={clientData}
            onSubmitUpdate={onSubmitUpdate}
            onChangeUpdate ={onChangeUpdate}
            onChangeCity={onChangeCity}
        />
    )
}

export default ClientProfile;