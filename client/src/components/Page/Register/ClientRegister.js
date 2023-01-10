import {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'; //need be imported in App.js
import {register, reset} from '../../../store/auth-slice'

const ClientRegister = () =>{

    const [data, setData] = useState({
        username:'',
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        picture:'',
        city:'',
        gender:''
    })

    //much easier way to colect all input values instaed using useState for each input 
    const {username, email, password, passwordRepeat, first_name, last_name, picture, city, gender} = data;
    //add type:client into data

    const dispatch = useDispatch();
    const {user, loading, success, error, message} = useSelector( (state) => state.auth)
    const navigate = useNavigate();


    //set spinner when is loading true
    // if(loading){
    //     return <Spiner></Spiner>
    // }

    console.log(data);

    useEffect( ()=>{
        //on every user,success,error,message state change chech status of states
        //and show the appropriate notification
        if(error)
            toast.error(message);
        
        //register.fulfilled trigger success=true (when is register success )
        //or if user is logged (after register) 
        if(success || user){
            navigate('/');
            toast.success(message);
        }
        //after all of this actions, we want to reset states
        dispatch(reset());

    },[user, success,error, message, navigate, dispatch])

    //on input change
    const onChange = (event) =>{
        const name = event.target.name;
        console.log("NA E: " + typeof(name));
        const value = event.target.value;

        setData(prev=> (
            {
                ...prev,
                [name]:value // example first_name:"Novak"
            }
        ))
    }

    const onImageChange = (event)=>{
        //on BACKEND we will take file from req and take fileName( unique generated when is uploaded to server)

        const file = event.target.files[0];
        // const fileName = file[0].file.name
        //const imgName = files.name; //this put in picture prop
        setData(prev =>(
            {
                ...prev,
                ["picture"]:file
            }
        ))
        console.log(file.name);
    }
    
    const onSubmit = (e) =>{
        e.preventDefault();

        if(password != passwordRepeat){
            alert("Passwords ins't same");
        }
        else{
            const {password, passwordRepeat, ...otherData} = data;
            //dispatchRedux action 
            
            //all state date append to data type variable 
            const formData = new FormData();
            for(const key in data){
                console.log("DATA: " + JSON.stringify(data))
                console.log(`${key}: ${data[key]}`)
                formData.append(key, data[key]);
                
            }
            //formData.append("picturePath", data['picture'].name);
            formData.append('type', 'Client');
            // const data = {...data, type:'client'}
            

            // const form = new FormData();
            // form.append('picture', data['picture'])
            // dispatch(register(formData));
            dispatch(register(formData));
        }
    }

    // const onChangeSelect =(e)=>{
    //     const genderSelect = e.target.value;
    // }

    return (
        <>
            <div>
                <h1>Register</h1>
            </div>

            <div className='form'>
                <form onSubmit={onSubmit} enctype="multipart/form-data">

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='username'
                            value={username}
                            placeholder='Enter username'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='password'
                            name='password'
                            value={password}
                            placeholder='Enter password'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='password'
                            name='passwordRepeat'
                            value={passwordRepeat}
                            placeholder='Repeat password'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='email'
                            type='email'
                            name='email'
                            value={email}
                            placeholder='Enter email'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='first_name'
                            name='first_name'
                            value={first_name}
                            placeholder='Enter first_name'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='last_name'
                            name='last_name'
                            value={last_name}
                            placeholder='Enter last_name'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='city'
                            name='city'
                            value={city}
                            placeholder='Enter city'
                            onChange={onChange}
                        />
                    </div>

                    <label>Pol</label>
                    {/* <select class="gender" onChange={onChangeSelect} name="gender" id='gender'> */}
                    <select class="gender" onChange={onChange} name="gender" id='gender'>
                        <option value=""></option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    <div class='form-group form-group-image'>
                        <label>Profile Picture</label>
                        <input type="file" onChange={onImageChange}  class='inputFile' name="picture" />
                    </div>


                    <div className ='button_container'>
                        <button type='submit' onClick={onSubmit} className='btn'>Submit</button>
                    </div>

                </form>
            </div>
        
        </>
    )
}

export default ClientRegister;