import {useState, useEffect, useRef, useCallback} from 'react';
import {handlerError} from '../utils/ErrorUtils.js';
import {getHouseworkerByFilter} from '../services/houseworker.js'
import {getRecommended} from '../services/client.js'
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';


//* Commit: removed errorHandler (just show error in console -> don't display as notification alert)
const useClient = (user) =>{
    //fetched(houseworker) Data based on filtered and searched Data
    const [data, setData] = useState([]);
    const [showRecommended, setShowRecommended] = useState(false);
    const [recommendedData, setRecommendedDate] = useState([]);
    const [loading, setLoading] = useState(true);

    //filtered data will be reset on compoent re-rendering(on every scroll )
    //that i stored filter data in localStorage
    const [filteredData, setFilterData] = useState({});
    const [searchedData, setSearchData] = useState({});

    const pageNumberRef = useRef(0);
    
    const debouncedHandleScroll = debounce(() =>{   
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
        const triggerThreshold = scrollableHeight - 200; 
        // if (window.scrollY >= triggerThreshold) {
        //pageNumberRef.current -1 prevent refetching houseworker after is fetched and there isn't new one.
        if (window.scrollY >= triggerThreshold && pageNumberRef.current != -1) {
            const newPage =  pageNumberRef.current+ 1;
            pageNumberRef.current = newPage;
            fetchData(newPage);
        }
    }, 50);
    
    //on initial check does localStorage (filtered Data exists and delete it)
    useEffect(()=>{
        if(localStorage.getItem("filteredData"))
            localStorage.clear("filteredData")
        
        if(localStorage.getItem("searchedData"))
            localStorage.clear('searchedData')

        window.addEventListener('scroll', debouncedHandleScroll);
        return () =>{
            window.removeEventListener('scroll',debouncedHandleScroll);
        }
    },[])

    //on every serachedData and filterData change reFeatch houseworkers
    useEffect(()=>{
        fetchData(pageNumberRef.current);
    },[searchedData, filteredData, user])
    //user because on logout(user change) houseworkers should be fetch again (recommended users removed)

    const fetchData = async(pageNubmer)=>{
        //pageNumber on initialization
        let queryParams = {pageNumber:pageNubmer}
        const savedFilteredData = JSON.parse(localStorage.getItem('filteredData'));
        const savedSearchedData = JSON.parse(localStorage.getItem('searchedData'));

        if(savedFilteredData!=null){
            queryParams = {...queryParams, ...savedFilteredData};
            //Filter option could be:{
            //     profession:[],
            //     city:,
            //     gender:,
            //     age:,
            // }
        }
        if(savedSearchedData!=null){
            queryParams = {...queryParams, ...savedSearchedData};
            //Search option could be:{
            //  Age:asc or desc, 
            //     Rating:asc or desc, 
            //     Name:'nov'
            //
        }
        try{
            const params = new URLSearchParams(queryParams);
            // console.log("URL: " + `http://localhost:5000/api/houseworker/filter?/${params}`);
            const houseworkers = await getHouseworkerByFilter(params);
            if(houseworkers.length >0){ 
                //if is new houseworkers fetched then contcatenate it with older houseworkers
                if(pageNumberRef.current > 0){

                    setData(prev =>([
                        ...prev,
                        ...houseworkers
                    ]))
                }
                else{
                    if(user!== null && !showRecommended){
                        const recommendedDataRes = await fetchRecommended(houseworkers);
                        setRecommendedDate({daa:"ASAS"});
                        //exclude houseworker that are same as recommendedDataRes
                        setData([...recommendedDataRes, ...houseworkers]);
                        setShowRecommended(true);
                    }
                    else{
                        setData(houseworkers);
                    }
                    
                }
            }
            else{
                //if houseworekrs exist on page then delete scroll event(prevent to go on next page)
                if(pageNumberRef.current > 0){
                    //set the PagenubmerRef to -1 to prevent fetching user that doesn't exist
                    //and showing this messages more times
                    pageNumberRef.current = -1;
                    toast.info("No more houseworkers",{
                        className:"toast-contact-message"
                    })
                }
                else{ //or on first page if there ins't houseworkers
                    setData(null);
                }
            }   
            
            setLoading(false);
        }
        catch(err){
            console.error(err);     
        }  
    }

    const fetchRecommended = async(houseworkers) =>{
        try{
            const recommendedDataResult = await getRecommended(user.username);
            return recommendedDataResult;
        }
        catch(err){
            console.error(err)
        }
    }
    
    const searchDataHanlder = useCallback((searchDataObj) =>{
        setSearchData(prev=>{
            const searchObject = {...prev}
            const newKey = Object.keys(searchDataObj);
            const newValue = searchDataObj[newKey];

            const currentKeys = Object.keys(searchObject);

            //Ensure if we click on same Sort (example AgeUp) then replace this sort with default "ASC"
            if(currentKeys.includes('sort')){
                if(searchObject['sort'] == newValue){
                    searchObject['sort'] = 'ASC';
                    localStorage.setItem('searchedData', JSON.stringify(searchObject));

                    setShowRecommended(false);
                    return searchObject
                }
            }
            if(newKey == 'name' & newValue == ''){
                if(searchObject['name']){
                    setShowRecommended(false);
                    delete searchObject.name;
                } 
            }

            searchObject[newKey] = newValue; //add or update key with value
            localStorage.setItem('searchedData', JSON.stringify(searchObject));
            return searchObject;
        })
        pageNumberRef.current = 0;

    },[searchedData]);
    // },[]);

    //On every re-rendering this function will be differentand without using useCallback and Filter component will be re-rendered(unnecessary)
    const filterDataHandler = useCallback((filterObj) =>{
        //filteredData is passed data from Children Component (Filter)
        pageNumberRef.current = 0;
        setFilterData(filterObj);        
        localStorage.setItem('filteredData', JSON.stringify(filterObj));
    },[filteredData]);

    return {data, loading, setLoading, pageNumberRef, searchDataHanlder, filterDataHandler}
}

export default useClient;