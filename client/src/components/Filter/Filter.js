//Compnent with different selection choice
import {useState, useEffect, useMemo, memo} from 'react';
import {getAllCities, getAllProfessions} from '../../services/houseworker.js'
import useUser from '../../hooks/useUser.js';
import FilterForm from './FilterForm.js';

const Filter = (prop) =>{
    
    console.log("FILTER RENDER");
    
    const [cities, setCities] = useState();
    const [professions, setProfessions] = useState();
    const {data:filters, onChange, onChangeProffesions, onChangeCity} = useUser({});
   
     //2 func merged in one async func
     const fetchData = async () =>{
        const professionsResult = await getAllProfessions();
        const citiesResult = await getAllCities(); 

        setProfessions(professionsResult);
        setCities(citiesResult);
    } 

    useEffect(()=>{
        fetchData();
    },[])

    // //Fetch professions only one
    // const fetchProfessions = async() => {
    //     const professionsResult = await getAllProfessions();
    //     console.log("PROFESSSION : " + JSON.stringify(professionsResult));
    //     setProfessions(professionsResult);
    // }

    // const fetchCities = async() =>{
    //     const citiesResult = await getAllCities();
    //     setCities(citiesResult);
    // }

    // useEffect(()=>{
    //     //This will trigger 2 times re-rendering
    //     // fetchProfessions();
    //     // fetchCities();

    //     //However, if there is a dependency between the two (e.g., the result of one fetch is needed to perform the other),
    //     //you might want to consider using Promise.all or chaining the promises to ensure a specific order of execution.
    //     // // Promise.all([fetchCities(), fetchProfessions()]).then(() => {
    //     // //     setLoading(false);
    //     // //   });
    //     // Promise.all([fetchCities(), fetchProfessions()]);
    
    // },[])

    
    //send filter options to parrent commpoent using prop.filterOptions ->passed funtion to this commponent
    const filterClickHanlder = (e) =>{
        prop.filterOptions(filters);
        console.log("FILTER APPLIED: " +   JSON.stringify(filters));
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
