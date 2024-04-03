import {useState, useEffect, useRef, useCallback} from 'react';
import {getHouseworkerByFilter} from '../services/houseworker.js'
import {getRecommended} from '../services/client.js'
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

const useClient = (user) =>{
    //fetched(houseworker) Data based on filtered and searched Data
    const [data, setData] = useState([]);
    const [showRecommended, setShowRecommended] = useState(false);
    const [loading, setLoading] = useState(true);

    //filtered data will be reset on compoent re-rendering(on every scroll )
    //that i stored filter data in localStorage
    const [filteredData, setFilterData] = useState({});
    const [searchedData, setSearchData] = useState({});

    const pageNumberRef = useRef(0);
    
    //this will ensure that the scroll event is not triggered multiple times in quick succession,
    //and thus help in fetching data only once on each scroll event.
    const debouncedHandleScroll = debounce(() =>{   
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
        //20px above page bottom
        const triggerThreshold = scrollableHeight - 200; 
        if (window.scrollY >= triggerThreshold) {
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

        //scroll event listener attached on intial page rendering
        window.addEventListener('scroll', debouncedHandleScroll);
        //cleanup function remove event listener on component unmount
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
                        const recommendedData = await fetchRecommended(houseworkers);
                        setData([...recommendedData, ...houseworkers]);
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
                    toast.info("No more houseworkers",{
                        className:"toast-contact-message"
                    })
                }
                else{ //or on first page if there ins't houseworkers
                    setData(null)
                }
            }   
            
            setLoading(false);
        }catch(err){
            console.error("ERR: " + err);
        }   
    }

    const fetchRecommended = async(houseworkers) =>{
        try{
            const recommendedData = await getRecommended(user.username);
            return recommendedData;
        }
        catch(err){
            console.error("Error wiht recommended fetch user " + err);
        }
    }
    
    const searchDataHanlder = useCallback((searchDataObj) =>{
        //searchData is data from SearchAndSort(Child) component
        console.log("SEARCH DATA HANDLER");
; 
        //This will ensure that the old key is overide with new value and new key added to this object
        setSearchData(prev=>{
            const search_obj = {...prev}
            //key of searchData (could be sort or name)
            const newKey = Object.keys(searchDataObj);
            const newValue = searchDataObj[newKey];

            const currentKeys = Object.keys(search_obj);

            //Ensure if we click on same Sort (example AgeUp) then replace this sort with default "ASC"
            if(currentKeys.includes('sort')){
                //(reset)show again initial houseworkers (without filters)
                if(search_obj['sort'] == newValue){
                    search_obj['sort'] = 'ASC';
                    localStorage.setItem('searchedData', JSON.stringify(search_obj));
                    //allowe displaying recommended users 
                    setShowRecommended(false);
                    return search_obj
                }
            }
            if(newKey == 'name' & newValue == ''){
                if(search_obj['name']){
                    setShowRecommended(false);
                    delete search_obj.name;
                } 
            }

            search_obj[newKey] = newValue; //add or update key with value
            localStorage.setItem('searchedData', JSON.stringify(search_obj));
            return search_obj;
        })
        pageNumberRef.current = 0;

    },[searchedData]);
    // },[]);

    //On every re-rendering this function will be differentand without using useCallback and Filter component will be re-rendered(unnecessary)
    const filterDataHandler = useCallback((filterData) =>{
        //filteredData is passed data from Children Component (Filter)
        console.log("FILTER DATA HANDLER");

        pageNumberRef.current = 0;
        setFilterData(filterData);        
        localStorage.setItem('filteredData', JSON.stringify(filterData));
    },[filteredData]);

    return {data, loading, setLoading, pageNumberRef, searchDataHanlder, filterDataHandler}
    // return {data, pageNumberRef, searchDataHanlder, filterDataHandler}
}

export default useClient;