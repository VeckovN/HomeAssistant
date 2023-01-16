//Compnent with different selection choice
import {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import Select from 'react-select';

import './Filter.css'

const Filter = (prop) =>{

    //To send data to Parrent Component use this
    // props.filter(FilterOBJ);

    const [filters, setFilters] = useState({});

    //getCities 
    const [cities, setCities] = useState([]);
    const [professions, setProfessions]= useState([]);


    useEffect(()=>{
        //THIS FECTCH FUNCTION COULD BE IN Services Folder and exported from there
       fetchCities()
       fetchProfessions();
    },[])

    const fetchCities = async() =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/cities`);
        const citiesResult = result.data;
        setCities(citiesResult);
    }
    
    const fetchProfessions = async() =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/professions`);
        const professionsResult = result.data;
        setProfessions(professionsResult);
    }


    const filterClickHanlder = (e) =>{
        alert("filter");
        //return this data to Parent Component
        //<Filter filterOptions={filterDataHandler}/> Parrent Component
        prop.filterOptions(filters);
        console.log("FILTER APPLIED: " + JSON.stringify(filters));
    }

    const onChangeHandler = (e) =>{
        const name = e.target.name;
        const value = e.target.value;

        console.log("FilterOption: " + name+" : " + value);

        setFilters(prev=>(
            {
                ...prev,
                [name]:value
            }
        ))
        console.log("FILTER_OBJ: " + JSON.stringify(filters));
    }

    //Push selected to "professions":[] array
    const onChangeProfessionHandler =(e)=>{
        // const professionsArray = e.target.name.jobs();
    }

    //Options for Professions select
    //For dynamic option fetch profession from DB and add it to options
    const options = [
        { value:'Cistac', label:"Cistac" },
        { value:'Dadilja', label:"Dadilja" },
        { value:'Kuvar', label:"Kuvar" },
        { value:'Staratelj', label:"Staratelj" },
        { value:'Sobarica', label:"Sobarica" },
        { value:'Domacica', label:"Domacica" }
    ]

    const onProfessionSelect = (e) =>{
        let professionsArray;
        professionsArray = Array.isArray(e) ? e.map(p => p.value): [];
        console.log("TEAKEE: "+ typeof(professionsArray));
        
        console.log("TAKEN PROFESSIONS: " + JSON.stringify(professionsArray))
        
        setFilters(prev =>(
            {
                ...prev,
                ["professions"]:professionsArray
            }
        ))
    }


    return (
        <div className='filterBox'>
            
            {/* <div className='select_filter_box'>
                <label className='filter_lb'>Profesije:</label>
                <div className='multiselect'>
                    <div className='selectBox'>
                        <select id='p2' className='professionLab'>
                            <option id='select'>Prikaz profesije</option>
                        </select>
                    </div>
                </div>
            </div> */}
            <Select 
                className='dropdown'
                placeholder="Select Profession"
                //Value for each option (in options object take key:Value )
                // value={options.filter(obj => )}
                options={options}
                onChange={onProfessionSelect}
                isMulti
                isClearable
            />
            

            {/* Component for multiple option select */}

            {/* GRAD */}
            <label className='filter-lb'>Grad:</label>
            <div className='filter-card'>   
                <input className='city-filter' onChange={onChangeHandler} type="text" name='city' list='cityname' placeholder="Izaberite Grad"/>
                <datalist id='cityname'>
                    {/* List here all Cities */}
                    {cities && cities.map(city=>
                        //return <option value={`${city}`}></option>
                        <option value={city}></option>
                    )}
                    {/* <option value='Beograd'/>
                    <option value='Novi Sad'/>
                    <option value='Nis'/>
                    <option value='Kragujevac'/>
                    <option value='Subotica'/>
                    <option value='Leskovac'/>
                    <option value='Pancevo'/>
                    <option value='Cacak'/>
                    <option value='Krusevac'/>
                    <option value='Kraljevo'/>
                    <option value='Novi Pazar'/>
                    <option value='Smederevo'/>
                    <option value='Uzice'/>
                    <option value='Valjevo'/>
                    <option value='Vranje'/>
                    <option value='Sabac'/>
                    <option value='Sombor'/>
                    <option value='Pozarevac'/>
                    <option value='Pirot'/>
                    <option value='Zajecar'/>
                    <option value='Bor'/>
                    <option value='Kikinda'/>
                    <option value='Sremska Mitrovica'/>
                    <option value='Jagodina'/>
                    <option value='Vrsac'/> */}
                </datalist>
            </div>


            {/* GENDER */}
            <label class='filter-lb'>Gender:</label>
            <div class='filter-card'>
                <div class='filter-item'>
                    <input type="radio"  onChange={onChangeHandler} name="gender" value="Male"/>
                    <label >Male</label><br/>
                    <input type="radio" onChange={onChangeHandler} name="gender" value="Female"/>
                    <label >Female</label><br/>
                </div>
            </div>

            {/* AGE */}
            <label class='filter-lb'>Age:</label>
            <div class='filter-card'>

                <div class='filter-item'>
                    <label>Od</label>
                    <input class='sl' type='number' onChange={onChangeHandler} name='ageFrom'/>
                </div>

                <div class='filter-item'>
                    <label>Do</label>
                    <input class='sl' type='number' onChange={onChangeHandler} name='ageTo'/>
                </div>
                
            </div>


            <div class='filter-card'>
                <button class ='filter-button' onClick={filterClickHanlder}>Filter</button>
            </div>

        </div>
    )

}

export default Filter;
