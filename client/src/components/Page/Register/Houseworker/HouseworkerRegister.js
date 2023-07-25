import {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {register, reset} from '../../../../store/auth-slice';
import {toast} from 'react-toastify';
import HouseworkerForm from './HouseworkerForm';

import '../Register.css';

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

    const { password, passwordRepeat} = data;
    
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

    const profession_options = [
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
        <HouseworkerForm
            data={data}
            city_options={city_options}
            profession_options={profession_options}
            onSubmit={onSubmit}
            onChange={onChange}
            onChangeCity={onChangeCity}
            onImageChange={onImageChange}
            onChangeProffesions={onChangeProffesions}
        />
    )

}

export default HouseworkerRegister