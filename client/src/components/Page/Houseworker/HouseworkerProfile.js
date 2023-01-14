import {useState, useEffect} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';

const HouseworkerProfile = () =>{

    const [updatedData, setUpdatedData] = useState({
        username:'',
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        picture:'',
        city:'',
        address:'',
        phone_number:''
    });

    const [houseworkerData, setHouseworkerData] = useState({})

    const {username, email, password, passwordRepeat, first_name, last_name, picture, city, gender, address, phone_number} = updatedData;

    useEffect(()=>{
        fetchData();
    }, [])

    const fetchData = async() =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/info`);
        const houseworkerResult = result.data;
        console.log("DATA : "  + JSON.stringify(houseworkerResult))
        setHouseworkerData(houseworkerResult);
    }

    const onChangeUpdate = (e)=>{
        const key = e.target.name;
        const value = e.target.value;
        setUpdatedData(prev => (
            {
                ...prev,
                [key] : value,
            }
        ))
    }

    const onImageChange = (event)=>{
        const file = event.target.files[0];
        setUpdatedData(prev =>(
            {
                ...prev,
                ["picture"]:file
            }
        ))
        console.log(file.name);
    }

    const onSubmitUpdate = async (e)=>{
        e.preventDefault();

        if(updatedData.password != updatedData.passwordRepeat)
            alert("Passwords have to be same")
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
    
                toast.success("Successfuly updated")
            }
            catch(err){
                console.log("Erorr: " + err);
                //eventualy set error state
                toast.error("Error updated")
            }
        }
    }

    return(
        <>
            <h1>Houseworker Profile</h1>
            <div className='container'>
                <form className='form-container' onSubmit={onSubmitUpdate}>
                    {/* left side */}
                    <div className='input-label-form'>
                        <div className='input-container'>
                            <label>Username: <b>{houseworkerData.username}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='username'
                            value={username}
                            placeholder='Enter username'
                            onChange={onChangeUpdate}
                            />
                        </div>
                        
                        <div className='input-container'>
                            <label>Email: <b>{houseworkerData.email}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='email'
                            name='email'
                            value={email}
                            placeholder='Enter Email'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div className='input-container'>
                            <label>Password</label>
                            <br/>
                            <input 
                            className='input_field'
                            type='password'
                            name='password'
                            value={password}
                            placeholder='Enter password'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        {password &&  //only if is password entered
                        <div className='input-container'>
                            <label>Repeat Password</label>
                            <br/>
                            <input 
                            className='input_field'
                            type='password'
                            name='passwordRepeat'
                            value={passwordRepeat}
                            placeholder='Repeat password'
                            onChange={onChangeUpdate}
                            />
                        </div>
                        }

                        <div className='input-container'>
                            <label>First Name: <b>{houseworkerData.first_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='first_name'
                            value={first_name}
                            placeholder='Enter First Name'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div className='input-container'>
                            <label>Last Name: <b>{houseworkerData.last_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='last_name'
                            value={last_name}
                            placeholder='Enter Last Name'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div className='input-container'>
                            <label>City: <b>{houseworkerData.city}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='city'
                            value={city}
                            placeholder='Enter City'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div className='input-container'>
                            <label>Address: <b>{houseworkerData.address}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='address'
                            value={address}
                            placeholder='Enter address'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div className='input-container'>
                            <label>Address: <b>{houseworkerData.phone_number}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='number'
                            name='phone_number'
                            value={phone_number}
                            placeholder='Enter the phone_number'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div classname='form-group form-group-image'>
                            <label>Profile Picture </label>
                            <br/>
                            <input type="file" onChange={onImageChange}  className='inputFile' name="picture" />
                        </div>

                        {/* button for submit Above inputs  */}
                        <button type='submit'>Update</button>
                    </div>
                    {/* right side */}
                    <div className='imageContainer'>
                        {/* <img></img> */}
                    </div>


                </form>
            </div>
        </>
    )
}

export default HouseworkerProfile;