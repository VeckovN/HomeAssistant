//Compnent with different selection choice
import {useState, useEffect, useMemo, memo} from 'react';
import {getAllCities, getAllProfessions} from '../../../../../services/houseworker.js'
import useUser from '../../../../../hooks/useUser.js';
import FilterForm from './FilterForm.js';

import '../../../../../sass/components/_filter.scss';
//import './Filter.css'

const Filter = (prop) =>{
    
    console.log("FILTER RENDER");
    
    const [cities, setCities] = useState();
    const [professions, setProfessions] = useState();
    const {data:filters, onChange, onChangeProffesions, onChangeCity} = useUser({});
    
    useEffect(()=>{
       fetchCities()
       fetchProfessions();
    },[])

    //Fetch professions only one
    
    const fetchProfessions = async() => {
        const professionsResult = await getAllProfessions();
        console.log("PROFESSSION : " + JSON.stringify(professionsResult));
        setProfessions(professionsResult);
    }

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
    const professions_options = useMemo(()=>professions?.map(profession => ({
        value:profession.title,
        label:profession.title
    })), [professions]);

    return (   
        <FilterForm
            city_options ={city_options}
            profession_options={professions_options}
            onChange={onChange}
            onChangeCity={onChangeCity}
            onChangeProffesions={onChangeProffesions}
            filterClickHanlder={filterClickHanlder}
        />
    )

}

export default memo(Filter);
