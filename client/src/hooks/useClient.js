//Hook that manage filtered and searched data(Houseworkers) on client home page

// TODO: -add pagination(Load first 5 on start then load more 5 on every bottom scroll)

import {useState, useEffect} from 'react';
import {getHouseworkerByFilter} from '../services/houseworker.js'
import {getRecommended} from '../services/client.js'
import { toast } from 'react-toastify';

const useClient = (user) =>{

    //fetched(houseworker) Data based on filtered and searched Data
    const [data, setData] = useState([]);

    const [recommended, setRecomended] = useState([]);
    const [showRecommended, setShowRecommended] = useState(false);

    const [filteredData, setFilterData] = useState({});
    const [searchedData, setSearchData] = useState({});

    //on every serachedData and filterData change reFeatch houseworkers
    useEffect(()=>{
        fetchData();
    },[searchedData, filteredData]) 

    useEffect(()=>{
        //only when is recommended button clicked and not fetched yet
        if(showRecommended==true && recommended.length == 0)
            fetchRecommendedData();
    },[showRecommended])


    const fetchData = async()=>{
        //Merge a filer and sort option to the queryParams OBJ
        let queryParams = {};
        if(filteredData!=''){
            queryParams = {...filteredData};
            //Filter option could be:{
            //     profession:[],
            //     city:,
            //     gender:,
            //     age:,
            // }
        }
        if(searchedData!=''){
            queryParams = {...queryParams, ...searchedData};
            //Search option could be:{
            //  Age:asc or desc, 
            //     Rating:asc or desc, 
            //     Name:'nov'
            //
        }
        try{
            //requestParams obj transfrom to URLParams
            const params = new URLSearchParams(queryParams);
            console.log("PARAMS: " + params);
            console.log("URL: " + `http://localhost:5000/api/houseworker/filter?/${params}`);
            
            const houseworkers = await getHouseworkerByFilter(params);
            if(houseworkers.length >0)
                setData(houseworkers);
            else
                setData(null)  
            
        }catch(err){
            console.log("ERR: " + err);
        }   
    }


    const fetchRecommendedData = async() =>{
        try{
            const recommendedData = await getRecommended(user.username);
            if(recommendedData.length >0){
                setRecomended(recommendedData)

                //recommended users deleted from data(prevent data for showing duplicate user(recommended))
                const updatedData = data.filter(user =>{
                    //return only different users
                    return !recommendedData.some(prop => prop.username === user.username)
                })
                setData(updatedData);
            }
            else
                setRecomended(null);
        }
        catch(err){
            console.log("ERR" + err);
        }
    }

    
    const searchDataHanlder = (searchDataObj) =>{
        //searchData is data from SearchAndSort(Child) component
        console.log("SEARCH: " + JSON.stringify(searchDataObj));
; 
        //This will ensure that the old key is overide with new value and new key added to this object
        setSearchData(prev=>{
            const search_obj = {...prev}
            //key of searchData (could be sort or name)
            const newKey = Object.keys(searchDataObj);
            const newValue = searchDataObj[newKey];
        
            //existed key in object
            const currentKey = Object.keys(search_obj);

            //Ensure if we click on same Sort (example AgeUp) then replace this sort with default "ASC"
            if(currentKey == 'sort'){
                //curent sort ecual as new click sort
                //example obj[currentKey] = 'AgeUp' and newValue ='AgeUp'
                if(search_obj[currentKey] == newValue){
                    search_obj[currentKey] = 'ASC';
                    return search_obj
                }
            }
            if(newKey == 'name' & newValue == ''){
                if(search_obj['name']){
                    alert("EHIST");
                    delete search_obj.name;
                    return search_obj;
                } 
                
            }

            console.log("OBJ BEFORE: " + JSON.stringify(search_obj))
            search_obj[newKey] = newValue; //add or update key with value
            console.log("OBJ AFTER: " + JSON.stringify(search_obj))
            
            return search_obj;
        })

    }

    const filterDataHandler = (filterData) =>{
        //filteredData is passed data from Children Component (Filter)
        console.log("FILTERS IN PARRANET" + JSON.stringify(filterData));
        setFilterData(filterData);
    }

    const onShowRecommended = ()=>{
        console.log("USER: " + JSON.stringify(user));
        if(user?.type === "Client") // ?. -if 'user' exist then user.type can be readed
            setShowRecommended(!showRecommended);
        else
            toast.error("Log in to see recommendetion",{
                className:"toast-contact-message"
            })
    }

    return {data, recommended, showRecommended, onShowRecommended, searchDataHanlder, filterDataHandler}
}

export default useClient;