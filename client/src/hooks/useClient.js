import {useState, useEffect, useRef, useCallback} from 'react';
import {handlerError} from '../utils/ErrorUtils.js';
import {getHouseworkerByFilter} from '../services/houseworker.js'
import {getRecommended} from '../services/client.js'
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

const useClient = (user) =>{
    const [initialData, setInitialData] = useState([]);
    const [newData, setNewData] = useState([]); //data on scroll 

    const [initialLoading, setInitialLoading] = useState(true);
    const [scrollInfiniteLoading, setScrollInfiniteLoading] = useState(false);

    const [showRecommended, setShowRecommended] = useState(false);
    const [recommendedData, setRecommendedDate] = useState([]);

    //filtered data will be reset on compoent re-rendering(on every scroll )
    //that i stored filter data in localStorage
    const [filteredData, setFilterData] = useState({});
    const [searchedData, setSearchData] = useState({});

    const pageNumberRef = useRef(0);
    
    const debouncedHandleScroll = debounce(() =>{   
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
        const triggerThreshold = scrollableHeight - 400; 
        if (window.scrollY >= triggerThreshold && pageNumberRef.current != -1) {
            const newPage =  pageNumberRef.current+ 1;
            pageNumberRef.current = newPage;
            fetchData(newPage, false);
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
        fetchData(0, true); 
        pageNumberRef.current = 0;   //pageNUmberRef.current is 0 but i want to ensure it anyways
        setNewData([]); //Clear any pending new data

    },[searchedData, filteredData, user])
    //user because on logout(user change) houseworkers should be fetch again (recommended users removed)


    const fetchData = async(pageNubmer, isInitialLoad = true)=>{

        if(isInitialLoad){
            setInitialLoading(true);
            setNewData([]); // Clear new data on fresh start
        }
        else{
            setScrollInfiniteLoading(true);
            setNewData([]); // Clear previous new data before fetching
        }

        //pageNumber on initialization
        let queryParams = {pageNumber:pageNubmer}
        const savedFilteredData = JSON.parse(localStorage.getItem('filteredData'));
        const savedSearchedData = JSON.parse(localStorage.getItem('searchedData'));

        if(savedFilteredData!=null){
            //Filter option could be:{ profession:[], city:, gender:, age: }
            queryParams = {...queryParams, ...savedFilteredData};
        }
        if(savedSearchedData!=null){
            //Search option could be:{ Age:asc or desc, Rating:asc or desc, Name:'nov'}  
            queryParams = {...queryParams, ...savedSearchedData};
        }
        try{
            const params = new URLSearchParams(queryParams);
            const houseworkers = await getHouseworkerByFilter(params);
            if(houseworkers.length >0){ 
                //if is new houseworkers fetched then contcatenate it with older houseworkers
                if(isInitialLoad){
                    if(user!== null && !showRecommended){
                        const recommendedDataRes = await fetchRecommended(houseworkers);
                        setRecommendedDate({daa:"ASAS"});
                        setInitialData([...recommendedDataRes, ...houseworkers]);
                        setShowRecommended(true);
                    }
                    else{
                        setInitialData(houseworkers);
                    }
                }
                else{
                    setNewData(houseworkers);
                }
            }
            else{
                //if houseworekrs exist on page then delete scroll event(prevent to go on next page)
                if(pageNumberRef.current > 0){
                    if(pageNubmer.current !== -1){
                        toast.info("No more houseworkers",{
                            className:"toast-contact-message"
                        })

                    }
                    pageNumberRef.current = -1;
                }
                else{
                    setInitialData([]);
                }
            }   
        
        }
        catch(err){
            console.error(err);     
        }  
        finally {
            //Claer appropriate loading states
            if(isInitialLoad){
                setInitialLoading(false);
            }
            else{
                setScrollInfiniteLoading(false);
            }
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

    const filterDataHandler = useCallback((filterObj) =>{
        //filteredData is passed data from Children Component (Filter)
        pageNumberRef.current = 0;
        setFilterData(filterObj);        
        localStorage.setItem('filteredData', JSON.stringify(filterObj));
    },[filteredData]);

    return {initialData, newData, initialLoading, scrollInfiniteLoading, pageNumberRef, searchDataHanlder, filterDataHandler}
}

export default useClient;