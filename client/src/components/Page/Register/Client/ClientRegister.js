import {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'; //need be imported in App.js
import {register, reset} from '../../../../store/auth-slice'
import ClientForm from './ClientForm';

import '../Register.css'

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

    const {password, passwordRepeat} = data;
    const dispatch = useDispatch();
    const {user, loading, success, error, message} = useSelector( (state) => state.auth)
    const navigate = useNavigate();

    //set spinner when is loading true
    // if(loading){
    //     return <Spiner></Spiner>
    // }

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
        console.log("NA E: " + typeof(name));
        const value = event.target.value;
        setData(prev=> (
            {
                ...prev,
                [name]:value
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

    const interests_options = [
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
        setData(prev=>(
            {
                ...prev,
                ["city"]:city
            }
        ))
    }

    return (
        <ClientForm 
            data={data}
            city_options={city_options}
            options={interests_options}
            onSubmit={onSubmit}
            onChange={onChange}
            onChangeCity={onChangeCity}
            onImageChange ={onImageChange}
            onChangeInterest={onChangeInterest}
        />
    )
}

export default ClientRegister;