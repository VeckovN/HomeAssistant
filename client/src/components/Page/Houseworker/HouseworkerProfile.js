import {useState, useEffect} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';
import Select from 'react-select';
import useUser from '../../../hooks/useUser';
import { city_options } from '../../../utils/options';

import '../../Page/Profile.css';

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
    const {username, email, password, passwordRepeat, first_name, last_name, city, address, phone_number} = updatedData;

    useEffect(()=>{
        fetchData();
    }, [])

    const fetchData = async() =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/info`);
        const houseworkerResult = result.data;
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
    
                const result = await axios.put(`http://localhost:5000/api/houseworker/update/`, newData);
                const comms = result.data;
                console.log("COMS : " + JSON.stringify(comms))
    
                toast.success("Successfully updated")
            }
            catch(err){
                console.log("Erorr: " + err);
                //eventualy set error state
                toast.error("Error updated")
            }
        }
    }

    console.log("HOPUISE : " + JSON.stringify(updatedData));

    return(
        <>
            <div className='profile_container'>
                <h1>Houseworker Profile</h1>
                <form className='profile_form' onSubmit={onSubmitUpdate}>
                    {/* left side */}
                    <div className='input-label-form'>
                        <div className='profile_input-container'>
                            <label>First name: <b>{houseworkerData.first_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='first_name'
                            value={first_name}
                            placeholder='Enter first name'
                            onChange={onChange}
                            />
                        </div>

                        <div className='profile_input-container'>
                            <label>Last name: <b>{houseworkerData.last_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='last_name'
                            value={last_name}
                            placeholder='Enter last name'
                            onChange={onChange}
                            />
                        </div>
                        
                        <div className='profile_input-container'>
                            <label>Email: <b>{houseworkerData.email}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='email'
                            name='email'
                            value={email}
                            placeholder='Enter email address'
                            onChange={onChange}
                            />
                        </div>

                        <div className='profile_input-container'>
                            <label>Password</label>
                            <br/>
                            <input 
                            className='input_field'
                            type='password'
                            name='password'
                            value={password}
                            placeholder='Enter password'
                            onChange={onChange}
                            />
                        </div>

                        {password &&  //only if is password entered
                        <div className='profile_input-container'>
                            <label>Repeat password</label>
                            <br/>
                            <input 
                            className='input_field'
                            type='password'
                            name='passwordRepeat'
                            value={passwordRepeat}
                            placeholder='Repeat password'
                            onChange={onChange}
                            />
                        </div>
                        }


                        <div className='profile_input-container'>
                            <label>Address: <b>{houseworkerData.address}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='address'
                            value={address}
                            placeholder='Enter address'
                            onChange={onChange}
                            />
                        </div>

                        <div className='profile_input-container'>
                            <label>Phone number: <b>{houseworkerData.phone_number}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='number'
                            name='phone_number'
                            value={phone_number}
                            placeholder='Enter phone number'
                            onChange={onChange}
                            />
                        </div>
                        
                        <div className='profile_input-container'>
                            <label>City: <b>{houseworkerData.city}</b></label>
                            <Select 
                                className='dropdown'
                                placeholder="Select a city"
                                //Value for each option (in options object take key:Value )
                                // value={options.filter(obj => )}
                                options={city_options}
                                onChange={onChangeCity}
                                isClearable
                            />
                        </div>
                        <br></br>
                        {/* button for submit Above inputs  */}
                        <button type='submit' className='profile_submit'>Update</button>
                    </div>

                </form>
            </div>
        </>
    )
}

export default HouseworkerProfile;