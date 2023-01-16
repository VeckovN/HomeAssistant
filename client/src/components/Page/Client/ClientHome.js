import axios from 'axios';
import url from 'url';
import { ReactFragment, useEffect, useState } from "react"
import HouseworkerCard from './houseworkers/HouseworkerCard'
import Filter from './houseworkers/Filter';
import SearchAndSort from './houseworkers/SearchAndSort';


const ClientHome = ({socket}) =>{

    //LIMIT IF IS GUEST 

    console.log("SOCKET " + socket);

    //const userAuth = useSelector(user) //example
    //const client = user.type==='client' ? true : false

    const [data, setData] = useState([]);
    const [filteredData, setFilterData] = useState({});
    const [searchedData, setSearchData] = useState({});

    //pagination also

    //Take date form Filter, SearchAndSort component (filterData, searchData)
    //use it to Fetch filtered data

    //FetcH data and create HouseWorkerCard LIST with filtered and sorted data
    
    const searchDataHanlder = (searchData) =>{
        //data from SearchAndSort component
        // setSearchData();
        //console.log("PARENT OPT: " + JSON.stringify(searchData);
        console.log("SEARCH: " + JSON.stringify(searchData));
        // setSearchData(searchData); 
        //This will ensure that the old key is overide with new value and new key added to this object
        setSearchData(prev=>{
            const obj = {...prev} //copy of prev useState
            //key of searchData (could be sort or name)
            const newKey = Object.keys(searchData);
            const newValue = searchData[newKey];
        
            //existed key in object
            const currentKey = Object.keys(obj);
            console.log("CURRENT KEY: " + currentKey)
            console.log("CURRENT Value: " + obj[currentKey])

            //Ensure if we click on same Sort (example AgeUp) then replace this sort with default "ASC"
            if(currentKey == 'sort'){
                //curent sort ecual as new click sort
                //example obj[currentKey] = 'AgeUp' and newValue ='AgeUp'
                if(obj[currentKey] == newValue){
                    obj[currentKey] = 'ASC';
                    return obj
                }
            }
            //if value of name ='' then delete this key from obj
            // if(currentKey == 'name'){
            // }

            console.log("OBJ BEFORE: " + JSON.stringify(obj))
            //ADD VALUE TO OBJECT KEY obj[sort] = value
            obj[newKey] = newValue; //add or update key with value
            console.log("OBJ AFTER: " + JSON.stringify(obj))
            //if we have name={NOTHING}
            return obj;
        })

        //reFetch houseworker with filters is simple, use this state searchData in
        //use effect as dependecies

    }

    const filterDataHandler = (filterData) =>{
        //filteredData is passed data from Children Component (Filter)
        console.log("FILTERS IN PARRANET" + JSON.stringify(filterData));
        setFilterData(filterData);
    }

    // const startFilterHandler = () =>{
    //     alert("hello");
    // }

    useEffect(()=>{
        fetchData();
    },[searchedData, filteredData]) //on every serachedData and filterData change reFeatch houseworkers


    
    const fetchData = async()=>{
        //Merge a filer and sort option to the queryParams OBJ
        let queryParams = {};
        if(filteredData!='' ){
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
            // const params = new URL.
            const params = new URLSearchParams(queryParams);
            console.log("PARAMS: " + params);
            console.log("URL: " + `http://localhost:5000/api/houseworker/filter?/${params}`);

            const result = await axios.get(`http://localhost:5000/api/houseworker/filter?${params}`);
            console.log("TP" + typeof(result));
            const houseworkers = result.data;

            console.log("HS: " + JSON.stringify(houseworkers));
            console.log("TYPE: " + typeof(houseworkers));
            setData(houseworkers);
            
        }catch(err){
            console.log("ERR: " + err);
        }   
    }


    let houseworkerList;
    {data ? 
        houseworkerList = data.map(user =>
            <div>
            <br/>
            <br/>
            <br/>
            {console.log("ID::: " + user.id)}
            <HouseworkerCard
                socket={socket}
                key={user.id}
                id={user.id}
                username={user.username}
                email={user.email}
                first_name={user.first_name}
                last_name={user.last_name}
                description={user.description}
                picture={user.picture}
                gender={user.gender}
                city={user.city}
                address={user.address}
                // phone_number={user.phone_number}
                professions={user.professions}
            />
            </div>
            )
            : houseworkerList =[]
    }

    return (
        <div>
            
                {searchedData && <h3>Search:{JSON.stringify(searchedData)}</h3>}
                <SearchAndSort search={searchDataHanlder}/>
                <Filter 
                    filterOptions={filterDataHandler}
                />
                <div className="houseworkers">
                    {houseworkerList.length > 0 ? houseworkerList : <h3>No Matches</h3> }
                </div>
        </div>
    )
    
}

export default ClientHome