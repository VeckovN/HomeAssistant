import {useState, useEffect, useMemo, memo} from 'react';
import {getProfessionsAndCities} from '../../services/houseworker.js'
import useUser from '../../hooks/useUser.js';
import FilterForm from './FilterForm.js';

const Filter = (prop) =>{
    
    const [cities, setCities] = useState();
    const [professions, setProfessions] = useState();
    const {data:filters, onChange, onChangeProffesions, onChangeCity} = useUser({});
   
    //concurrent requests to different endpoints - impl in Service with axios.all
    const fetchData =  async () =>{
        const result = await getProfessionsAndCities();
        setProfessions(result.houseworker_professions);
        setCities(result.houseworker_cities);
    }

    useEffect(()=>{
        fetchData();
    },[])
    
    //sending filter options to parrent commpoent using prop.filterOptions ->passed funtion to this commponent
    const filterClickHanlder = (e) =>{
        prop.filterOptions(filters);
    }

    //cities_options will be only recalcualted when cities are changed
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
