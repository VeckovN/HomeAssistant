import axios from 'axios';
import url from 'url';
import { ReactFragment, useEffect, useState } from "react"

const ClientHome = () =>{

    const [data, setData] = useState('');
    const [filteredData, setFilterData] = useState({city:"Beograd", gender:'male'});
    const [searchedData, setSearchData] = useState({age:'DESC', name:"n"});



    //pagination also

    //Take date form Filter, SearchAndSort component (filterData, searchData)
    //use it to Fetch filtered data

    //FetcH data and create HouseWorkerCard LIST with filtered and sorted data
    
    const searchDataHanlder = (searchData) =>{
        //data from SearchAndSort component
        // setSearchData();

    }

    const filterDataHandler = (filterData) =>{
        //data from Filter componnent
        // setFilterData();
    }


    useEffect(()=>{

        fetchData();

    },[])


    
    const fetchData = async()=>{
        let queryParams = {};
        try{
            if(filteredData!='' ){
                //Filter option could be:{
                //     profession:[],
                //     city:,
                //     gender:,
                //     age:,
                // }
                queryParams = {...filteredData};
            }
            if(searchedData!=''){
                 //Search option could be:{
                //  Age:asc or desc, 
                //     Rating:asc or desc, 
                //     Name:'nov'
                //
                queryParams = {...queryParams, ...searchedData};
            }
            //requestParams obj transfrom to URLParams
            // const params = new URL.
            const params = new URLSearchParams(queryParams);
            console.log("PARAMS: " + params);
            console.log("URL: " + `http://localhost:5000/api/houseworker/filter/${params}`);

            const result = await axios.get(`http://localhost:5000/api/houseworker/filter?${params}`);
            const houseworkers = result.data;

            console.log("HS: " + result);
            // setData();
        }catch(err){
            console.log("ERR: " + err);
        }   
    }



    //search data without filter
    // cosnt 

    // let HouseworkerList;
    // {(filteredData || searchedData) ? 

    //     HouseworkerList = 

    // : HouseworkerList=[]}

    


    return (
        <div>

                {/* <SearchAndSort search={searchDataHanlder}></SearchAndSort>
                <Filter filter={filterDataHandler}></Filter> */}
                
        </div>
    )
    
}

export default ClientHome