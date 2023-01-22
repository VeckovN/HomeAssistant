import {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'; //need be imported in App.js
import Select from 'react-select';
import {register, reset} from '../../../store/auth-slice'

import './Register.css'

const ClientRegister = () =>{
    //@TODO - Create custom hook for storing and manipulation with this data( repeated in onther components)
    const [data, setData] = useState({
        username:'',
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        picture:'',
        city:'',
        gender:'',
        interests:[]
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
        const file = event.target.files[0];
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
            
            dispatch(register(formData));
        }
    }

    // const onChangeSelect =(e)=>{
    //     const genderSelect = e.target.value;
    // }

    const options = [
        { value:'Cistac', label:"Cistac" },
        { value:'Dadilja', label:"Dadilja" },
        { value:'Kuvar', label:"Kuvar" },
        { value:'Staratelj', label:"Staratelj" },
        { value:'Sobarica', label:"Sobarica" },
        { value:'Domacica', label:"Domacica" }
    ]

    const onChangeInterest = (e) =>{
        let professionsArray;
        professionsArray = Array.isArray(e) ? e.map(p => p.value): [];
        console.log("TEAKEE: "+ typeof(professionsArray));
        
        console.log("TAKEN PROFESSIONS: " + JSON.stringify(professionsArray))
        
        setData(prev =>(
            {
                ...prev,
                ["interests"]:professionsArray
            }
        ))
    }

    const city_options =[
        {value:'Beograd', label:"Beograd"},
        {value:'Novi Sad' , label:"Novi Sad"},
        {value:'Nis' , label:"Nis"},
        {value:'Kragujevac' , label:"Kragujevac"},
        {value:'Subotica' , label:"Subotica"},
        {value:'Leskovac' , label:"Leskovac"},
        {value:'Pancevo' , label:"Pancevo"},
        {value:'Cacak' , label:"Cacak"},
        {value:'Krusevac' , label:"Krusevac"},
        {value:'Kraljevo' , label:"Kraljevo"},
        {value:'Novi Pazar' , label:"Novi Pazar"},
        {value:'Smederevo' , label:"Smederevo"},
        {value:'Uzice' , label:"Uzice"},
        {value:'Valjevo' , label:"Valjevo"},
        {value:'Vranje' , label:"Vranje"},
        {value:'Sabac' , label:"Sabac"},
        {value:'Sombor' , label:"Sombor"},
        {value:'Pozarevac' , label:"Pozarevac"},
        {value:'Pirot' , label:"Pirot"},
        {value:'Zajecar' , label:"Zajecar"},
        {value:'Bor' , label:"Bor"},
        {value:'Kikinda' , label:"Kikinda"},
        {value:'Sremska Mitrovica' , label:"Sremska Mitrovica"},
        {value:'Jagodina' , label:"Jagodina"},
        {value:'Vrsac' , label:"Vrsac"}
    ]

    const onChangeCity = (e) =>{
        let city = e.value;
        console.log("CITTYYYY: " + city);

        setData(prev=>(
            {
                ...prev,
                ["city"]:city
            }
        ))
    }

    console.log("INTERESTS: " + JSON.stringify(data.interests));

    return (
        <>
            <div className='register_container'>
                <form onSubmit={onSubmit} enctype="multipart/form-data">
                <div className='form_title'>Registracija Klijenta</div>
                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='username'
                            value={username}
                            placeholder='Unesite korisnicko ime'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='password'
                            name='password'
                            value={password}
                            placeholder='Unesite sifru'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='password'
                            name='passwordRepeat'
                            value={passwordRepeat}
                            placeholder='Ponovite sifru'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='email'
                            type='email'
                            name='email'
                            value={email}
                            placeholder='Unesite email'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='first_name'
                            name='first_name'
                            value={first_name}
                            placeholder='Unesite Ime'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='last_name'
                            name='last_name'
                            value={last_name}
                            placeholder='Unesite Prezime'
                            onChange={onChange}
                        />
                    </div>

                    <br></br>
                    <Select 
                        className='dropdown'
                        placeholder="Izaberite Grad"
                        //Value for each option (in options object take key:Value )
                        // value={options.filter(obj => )}
                        options={city_options}
                        onChange={onChangeCity}
                        isClearable
                    />

                    <label className='label_input'>Pol</label>
                    {/* <select class="gender" onChange={onChangeSelect} name="gender" id='gender'> */}
                    <select className="gender_option" onChange={onChange} name="gender" id='gender'>
                        <option value="">Izaberite Pol</option>
                        <option value="Male">Musko</option>
                        <option value="Female">Zensko</option>
                    </select>

                    <label>Profile Picture</label>
                    <div class='form-group form-group-image'>
                        <input type="file" onChange={onImageChange}  class='inputFile' name="picture" />
                    </div>
                    

                    <label className='label_input'>Interests</label>
                    <Select 
                        className='dropdown'
                        placeholder="Izaberite Profesije koje vas zanimaju"
                        //Value for each option (in options object take key:Value )
                        // value={options.filter(obj => )}
                        options={options}
                        onChange={onChangeInterest}
                        isMulti
                        isClearable
                    />

                    <div className ='register_button_container'>
                        <button type='submit' onClick={onSubmit} className='btn'>Registruj</button>
                    </div>

                </form>
            </div>
        
        </>
    )
}

export default ClientRegister;