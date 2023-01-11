import {useState, useEffect} from 'react';

//For user enterd value Validation use useState()
//for only taking value on submit(without validation) better choice is useRef
const ClientProfile = () =>{ 

    const [updated, setUpdated] = useState({
        username:'',
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        picture:'',
        city:'',
        gender:''
    });

    const {username, email, password, passwordRepeat, first_name, last_name, picture, city, gender} = updated;



    const onChangeUpdate = (e)=>{
        
        const key = e.target.name;
        const value = e.target.value;
        setUpdated(prev => (
            {
                ...prev,
                [key] : value,
            }
        ))
    }

    const onImageChange = (event)=>{
        const file = event.target.files[0];
        setData(prev =>(
            {
                ...prev,
                ["picture"]:file
            }
        ))
        console.log(file.name);
    }

    console.log("UpdatedData: \n" + JSON.stringify(updated));

    const onSubmitUpdate = (e)=>{
        e.preventDefault();
    }

    // username:'',
    // email:'',
    //     password:'',
    //     passwordRepeat:'',
    //     first_name:'',
    //     last_name:'',
    //     picture:'',
    //     city:'',
    //     gender:''

    //Update only keys(Property) which have passed value
    return(
        <>  <h1>CLient Profile</h1>
            <h1>Update Profiles</h1>
            <div className='container'>
                <form className='form-container' onSubmit={onSubmitUpdate}>
                    {/* left side */}
                    <div className='input-label-form'>
                        <div className='input-container'>
                            <label>Username:</label>
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
                            <label>Email</label>
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
                            <label>First Name</label>
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
                            <label>Last Name</label>
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
                            <label>City</label>
                            <input 
                            className='input_field'
                            type='text'
                            name='city'
                            value={city}
                            placeholder='Enter City'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div class='form-group form-group-image'>
                            <label>Profile Picture</label>
                            <input type="file" onChange={onImageChange}  class='inputFile' name="picture" />
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

export default ClientProfile;