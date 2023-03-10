import {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {register, reset} from '../../../store/auth-slice';
import {toast} from 'react-toastify';
import Select from 'react-select';

import './Register.css';

const HouseworkerRegister = () =>{

    const [data, setData] = useState({
        username:'',
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        age:'',
        picture:'',
        gender:'',
        city:'',
        address:'',
        description:'',
        phone_number:'',
        professions:[],
    })

    const {username, email, password, passwordRepeat, first_name, last_name, age, picture, city, gender, address, description, phone_number} = data;
    
    const dispatch = useDispatch();
    const {user, loading, success, error, message} = useSelector( (state) => state.auth)
    const navigate = useNavigate();

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

    const onChange = (event) =>{
        const name = event.target.name;
        let value;
        if(name=="age")
            value = parseInt(event.target.value);
        
        value = event.target.value;

        setData(prev=> (
            {
                ...prev,
                [name]:value // example first_name:"Novak"
            }
        ))
    }

    const options = [
        { value:'Cistac', label:"Cistac" },
        { value:'Dadilja', label:"Dadilja" },
        { value:'Kuvar', label:"Kuvar" },
        { value:'Staratelj', label:"Staratelj" },
        { value:'Sobarica', label:"Sobarica" },
        { value:'Domacica', label:"Domacica" }
    ]

    const onChangeProffesions = (e) =>{
        let professionsArray;
        professionsArray = Array.isArray(e) ? e.map(p => p.value): [];
        console.log("TEAKEE: "+ typeof(professionsArray));
        
        console.log("TAKEN PROFESSIONS: " + JSON.stringify(professionsArray))
        
        setData(prev =>(
            {
                ...prev,
                ["professions"]:professionsArray
            }
        ))
    }

    const onImageChange = (event) =>{
        const file = event.target.files[0];
        setData(prev =>(
            {
                ...prev,
                ["picture"]:file
            }
        ))
    } 

    console.log("DATA: " + JSON.stringify(data));
    
    const onSubmit = (e) =>{
        e.preventDefault();

        if(password != passwordRepeat){
            alert("Passwords ins't same");
        }
        else{
            const {password, passwordRepeat, ...otherData} = data;
            
            const formData = new FormData();
            for(const key in data){
                console.log("DATA: " + JSON.stringify(data))
                console.log(`${key}: ${data[key]}`)
                formData.append(key, data[key]);         
            }
            formData.append('type', 'Houseworker');
            
            dispatch(register(formData));

        }
    }

    return (
        <>
            <div className='register_container'>
                <form onSubmit={onSubmit} >
                <div className='form_title'>Registracija kucnog pomocnika</div>
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
                            type='text'
                            name='email'
                            value={email}
                            placeholder='Unesite email'
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
                            type='passwordRepeat'
                            name='passwordRepeat'
                            value={passwordRepeat}
                            placeholder='Ponovite sifru'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='first_name'
                            value={first_name}
                            placeholder='Unesite Ime'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='last_name'
                            value={last_name}
                            placeholder='Unesite Prezime'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='number'
                            name='age'
                            value={age}
                            placeholder='Unesite godine'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='city'
                            name='city'
                            value={city}
                            placeholder='Odaberite grad'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='address'
                            name='address'
                            value={address}
                            placeholder='Unesite adresu'
                            onChange={onChange}
                        />
                    </div>
                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='number'
                            name='phone_number'
                            value={phone_number}
                            placeholder='Unesite broj telefona'
                            onChange={onChange}
                        />
                    </div>

                    <label className='label_input'>Pol</label>
                    <select className="gender_option" onChange={onChange} name="gender" id='gender'>
                        <option value="">Odaberite Pol</option>
                        <option value="Male">Musko</option>
                        <option value="Female">Zensko</option>
                    </select>

                    <label className='label_input'>Profilna slika</label>
                    <div className='form-group form-group-image'>
                        <input type="file" onChange={onImageChange}  class='inputFile' name="picture" />
                    </div>

                    <br/>
                    <Select 
                        className='dropdown'
                        placeholder="Select Profession"
                        //Value for each option (in options object take key:Value )
                        // value={options.filter(obj => )}
                        options={options}
                        onChange={onChangeProffesions}
                        isMulti
                        isClearable
                    />
                    <br/>

                    <label className='label_input'>Opis</label>
                    <textarea onChange={onChange} rows="5" cols="20" className="descriptionBox"  name="description"></textarea>

                    <div className ='register_button_container'>
                        <button type='submit' onClick={onSubmit} className='btn'>Submit</button>
                    </div>

                </form>
            </div>
        
        
        </>
    )

}

export default HouseworkerRegister