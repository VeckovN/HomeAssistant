//Compnent with different selection choice
import {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import Select from 'react-select';
import {profession_options} from '../../../../../utils/options.js'
import useUser from '../../../../../hooks/useUser.js';

import './Filter.css'

const Filter = (prop) =>{

    //To send data to Parrent Component use this
    // props.filter(FilterOBJ);

    // const [filters, setFilters] = useState({});
    //getCities 
    const [cities, setCities] = useState();
    const initialState = {}

    const {data:filters, onChange, onChangeProffesions, onChangeCity} = useUser(initialState);

    useEffect(()=>{
        //THIS FECTCH FUNCTION COULD BE IN Services Folder and exported from there
       fetchCities()
    //    fetchProfessions();
    },[])

    const fetchCities = async() =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/cities`);
        const citiesResult = result.data;
        setCities(citiesResult);
    }
    
    // const fetchProfessions = async() =>{
    //     const result = await axios.get(`http://localhost:5000/api/houseworker/professions`);
    //     const professionsResult = result.data;
    //     setProfessions(professionsResult);
    // }

    const filterClickHanlder = (e) =>{
        prop.filterOptions(filters);
        console.log("FILTER APPLIED: " + JSON.stringify(filters));
    }
    

    //Only cityies of existing HouseWorkers
    var city_options =[]
    // city_option =  cities.map(city=> (return {value:city, label:city}))
    if(cities){
        cities.forEach(city =>(
            city_options.push({value:city, label:city})
        ))
    }

    console.log("FIIIIIIIII: " + JSON.stringify(filters));

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
            <div className='select-filter-box'>
                <Select 
                    className='dropdown'
                    placeholder="Select profession"
                    //Value for each option (in options object take key:Value )
                    // value={options.filter(obj => )}
                    options={profession_options}
                    onChange={onChangeProffesions}
                    isMulti
                    isClearable
                />
            </div>
            

            {/* Component for multiple option select */}

            {/* GRAD */}
            <label className='filter-lb'>City:</label>
            <div className='filter-card'>   
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

            {/* GENDER */}
            <label class='filter-lb'>Gender:</label>
            <div class='filter-card'>
                <div class='filter-item'>
                    {/* <input type="radio"  onChange={onChangeHandler} name="gender" value="Male"/> */}
                    <input type="radio"  onChange={onChange} name="gender" value="Male"/>
                    <label >Male</label><br/>
                    {/* <input type="radio" onChange={onChangeHandler} name="gender" value="Female"/> */}
                    <input type="radio" onChange={onChange} name="gender" value="Female"/>
                    <label >Female</label><br/>
                </div>
            </div>

            {/* AGE */}
            <label class='filter-lb'>Age:</label>
            <div class='filter-card'>

                <div class='filter-item'>
                    <label>From</label>
                    {/* <input class='sl' type='number' onChange={onChangeHandler} name='ageFrom'/> */}
                    <input class='sl' type='number' onChange={onChange} name='ageFrom'/>
                </div>

                <div class='filter-item'>
                    <label>To</label>
                    {/* <input class='sl' type='number' onChange={onChangeHandler} name='ageTo'/> */}
                    <input class='sl' type='number' onChange={onChange} name='ageTo'/>
                </div>
                
            </div>

            <div class='filter-card'>
                <button class ='filter-button' onClick={filterClickHanlder}>Filter</button>
            </div>

        </div>
    )

}

export default Filter;
