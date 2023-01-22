import {useState, useEffect} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';
import Select from 'react-select';

import './ClientProfile.css'


//For user enterd value Validation use useState()
//for only taking value on submit(without validation) better choice is useRef
const ClientProfile = () =>{ 

    const [updatedData, setUpdatedData] = useState({
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        picture:'',
        city:'',
    });

    const [clientData, setClientData] = useState({})

    //setted value on fetch
    useEffect( ()=>{
        fetchData()
    }, [])

    const fetchData = async() =>{
        const result = await axios.get(`http://localhost:5000/api/clients/info`)
        const ClientData = result.data;
        //console.log("RATING: " + JSON.stringify(ratingValue));
        console.log("DATA : "  + JSON.stringify(ClientData))
        setClientData(ClientData);
    }

    // const [updatedData, setUpdatedData] = useState({});

    console.log("FETCHED DATA: " + JSON.stringify(clientData));

    const {username, email, password, passwordRepeat, first_name, last_name, picture, city, gender} = updatedData;


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

    const onChangeCity = (e) =>{
        let city = e.value;
        console.log("CITTYYYY: " + city);

        setUpdatedData(prev=>(
            {
                ...prev,
                ["city"]:city
            }
        ))
    }


    console.log("UpdatedData: \n" + JSON.stringify(updatedData));

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
                        console.log("K " + key);
                        //data object wiht only updated props (for HTTP request)
                        newData[key] = updatedData[key];
                        
                        setClientData(prev =>({
                            ...prev,
                            //BECAUSE 'key' is STRING and MUST use []  
                            [key] : updatedData[key] 
                        }))
                        console.log("SDSDASD: " + JSON.stringify(clientData));
                        console.log("DATAAAA: " + JSON.stringify(newData));
                    }
                })
    
                // if(updatedData.picture !=''){
                //     await axios.put(`http://localhost:5000/api/clients/updateImage/`, updateImage);
                // }
    
                const result = await axios.put(`http://localhost:5000/api/clients/update/`, newData);
                const comms = result.data;
                console.log("COMS : " + JSON.stringify(comms))
    
                toast.success("Uspesno azurirano")
    
    
            }
            catch(err){
                console.log("Erorr: " + err);
                //eventualy set error state
                toast.error("Error updated")
            }
        }
        

        

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

    //Update only keys(Property) which have passed value
    return(
        <div className='profile_container'>
          <h1>Profil Klijenta</h1>
                <form className='profile_form' onSubmit={onSubmitUpdate}>
                    {/* left side */}
                    <div className='input-label-form'>
                        <div className='profile_input-container'>
                            <label>Ime: <b>{clientData.first_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='first_name'
                            value={first_name}
                            placeholder='Upisite Ime'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div className='profile_input-container'>
                            <label>Prezime: <b>{clientData.last_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='last_name'
                            value={last_name}
                            placeholder='Upisite Prezime'
                            onChange={onChangeUpdate}
                            />
                        </div>
                        
                        <div className='profile_input-container'>
                            <label>Email: <b>{clientData.email}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='email'
                            name='email'
                            value={email}
                            placeholder='Upisite Email adresu '
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div className='profile_input-container'>
                            <label>Sifra</label>
                            <br/>
                            <input 
                            className='input_field'
                            type='password'
                            name='password'
                            value={password}
                            placeholder='Upisite sifru'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        {password &&  //only if is password entered
                        <div className='profile_input-container'>
                            <label>Ponovi Sifru</label>
                            <br/>
                            <input 
                            className='input_field'
                            type='password'
                            name='passwordRepeat'
                            value={passwordRepeat}
                            placeholder='Ponovite sifru'
                            onChange={onChangeUpdate}
                            />
                        </div>
                        }

                        

                        <div className='profile_input-container'>
                            <label>Grad: <b>{clientData.city}</b></label><br/>
                            <Select 
                                className='dropdown'
                                placeholder="Izaberite Grad"
                                //Value for each option (in options object take key:Value )
                                // value={options.filter(obj => )}
                                options={city_options}
                                onChange={onChangeCity}
                                isClearable
                            />
                        </div>
                        <br></br>



                      

                        {/* button for submit Above inputs  */}
                        <button type='submit' className='profile_submit'>Azuriraj</button>
                    </div>


                </form>
        </div>
    )
}

export default ClientProfile;