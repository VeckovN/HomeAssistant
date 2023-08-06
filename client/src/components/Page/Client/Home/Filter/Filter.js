//Compnent with different selection choice
import {useState, useEffect, useRef, useMemo} from 'react';
import axios from 'axios';
import Select from 'react-select';
import {profession_options} from '../../../../../utils/options.js'
import {getAllCities } from '../../../../../services/houseworker.js'
import useUser from '../../../../../hooks/useUser.js';
import FilterForm from './FilterForm.js';


import './Filter.css'

const Filter = (prop) =>{
    
    const [cities, setCities] = useState();
    const {data:filters, onChange, onChangeProffesions, onChangeCity} = useUser({});
    
    useEffect(()=>{
       fetchCities()
    },[])

    const fetchCities = async() =>{
        const citiesResult = await getAllCities();
        setCities(citiesResult);
    }
    
    //send filter options to parrent commpoent using prop.filterOptions ->passed funtion to this commponent
    const filterClickHanlder = (e) =>{
        prop.filterOptions(filters);
        console.log("FILTER APPLIED: " + JSON.stringify(filters));
    }

    //cities_options will be only recalcuated when is cities changed
    const city_options = useMemo(() => cities?.map(city =>({ value: city, label: city })), [cities]);
    // console.log("FIIIIIIIII: " + JSON.stringify(filters));

    return (   
        <FilterForm
            city_options ={city_options}
            profession_options={profession_options}
            onChange={onChange}
            onChangeCity={onChangeCity}
            onChangeProffesions={onChangeProffesions}
            filterClickHanlder={filterClickHanlder}
        />
    )

}

export default Filter;
