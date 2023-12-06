//Hook that manage filtered and searched data(Houseworkers) on client home page

// TODO: -add pagination(Load first 5 on start then load more 5 on every bottom scroll)
// FIXME: - City filter (probably others) doesn't work when is recommended button clicked(recommended showned)

import {useState, useEffect, useRef, useCallback} from 'react';
import {getHouseworkerByFilter} from '../services/houseworker.js'
import {getRecommended} from '../services/client.js'
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';

const useClient = (user) =>{
    console.log("use Client");

    //fetched(houseworker) Data based on filtered and searched Data
    const [data, setData] = useState([]);
    //data before removing recommended users in data useState
    const [oldData,setOldData] = useState([]); 

    const [recommended, setRecomended] = useState([]);
    const [showRecommended, setShowRecommended] = useState(false);
    const [loading, setLoading] = useState(true);

    //filtered data will be reset on compoent re-rendering(on every scroll )
    //that i stored filter data in localStorage
    const [filteredData, setFilterData] = useState({});
    const [searchedData, setSearchData] = useState({});

    const pageNumberRef = useRef(0);
    
    //on initial check does localStorage (filtered Data exists and delete it)
    useEffect(()=>{
        //console.log("FIRST USE EFFFFFE");
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
        //alert('fetchData(pageNumberRef.current);');
        fetchData(pageNumberRef.current);
    },[searchedData, filteredData]) 


    //IT"S APPLIED ON FIRST (Mounted ) BUT AND CAUSED UNNECESSARY RE-rENDERING 
    //It should be only trigger when is recomended button click

    // useEffect(()=>{
    //     alert('useEffect(() showrec, recmonmended');
    //     //only when is recommended button clicked and not fetched yet
    //     if(showRecommended==true && recommended?.length == 0)
    //         fetchRecommendedData();
    //     else{
    //         alert('setData(oldData);');
    //         setData(oldData);
    //     }
            
    // },[showRecommended, recommended])


    //this will ensure that the scroll event is not triggered multiple times in quick succession,
    //and thus help in fetching data only once on each scroll event.
    const debouncedHandleScroll = debounce(() =>{  
        // alert("debouncedHandleScroll = debounce(()")    
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
        if (window.scrollY >= scrollableHeight) {
            const newPage =  pageNumberRef.current+ 1;
            pageNumberRef.current = newPage;

            fetchData(newPage);
        }
    }, 50); //debounce delay 

    // //scroll event listener attached on intial page rendering
    // useEffect(()=>{
    //     window.addEventListener('scroll', debouncedHandleScroll);
    //     //cleanup function remove event listener on component unmount
    //     return () =>{
    //         window.removeEventListener('scroll',debouncedHandleScroll);
    //     }
    // },[]);

    


    const fetchData = async(pageNubmer)=>{
        //alert('fetchData = async(pageNubmer)');
        //Merge a filer and sort option to the queryParams OBJ
        //let queryParams = {};
    
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
            console.log("PARAMS: " + params);
            console.log("URL: " + `http://localhost:5000/api/houseworker/filter?/${params}`);
            
            const houseworkers = await getHouseworkerByFilter(params);
            console.log("HOUSEWORKERSSSSSSSSSS: " +  JSON.stringify(houseworkers))
            if(houseworkers.length >0){
                //if is new houseworkers fetched then contcatenate it with older houseworkers
                
                //if is recommended user showned - exclude it from other users
                if(showRecommended){
                    const updatedData = excludeRecommendedFromUserData(data, recommended);
                    setData(updatedData);
                    alert("setData(updatedData);");
                }
                if(pageNumberRef.current > 0){
                    setData(prev =>([
                        ...prev,
                        ...houseworkers
                    ]))
                    //alert(" setData(prev =>([...prev,...houseworkers]))")
                }
                else{
                    setData(houseworkers);
                    //alert("setData(houseworkers);")
                }

                
                // setOldData(houseworkers);
                // alert("setOldData(houseworkers);;")
            }
            else{
                //if houseworekrs exist on page then delete scroll event(prevent to go on next page)
                if(pageNumberRef.current > 0){
                    alert("pageNumberRef.current > 0")
                    toast.info("No more houseworkers",{
                        className:"toast-contact-message"
                    })
                }
                else{ //or on first page if there ins't houseworkers
                    setData(null)
                    alert("setData(null)")
                }
            }   
            
            setLoading(false);
           //alert("setLoading(false);")
        }catch(err){
            console.log("ERR: " + err);
        }   
    }

    const fetchRecommendedData = async() =>{
        alert('const fetchRecommendedData = async() =>{');
        try{
            const recommendedData = await getRecommended(user.username);
            if(recommendedData.length >0){
                setRecomended(recommendedData)
                alert('setRecomended(recommendedData)');
                const updatedData = excludeRecommendedFromUserData(data, recommendedData);
                setData(updatedData);
                alert("setData(updatedData);")
            }
            else{
                setRecomended(null);
                alert("setRecomended(null);")
            }
            
        }
        catch(err){
            console.log("ERR" + err);
        }
    }
    
    const excludeRecommendedFromUserData = (user_data, recommended_data) =>{
        alert("excludeRecommendedFromUserData = (user_data, recommended_data) =>{")
        const updatedData = user_data.filter(user =>{
            //return only different users
            return !recommended_data.some(prop => prop.username === user.username)
        })
        return updatedData
    }
    
    const searchDataHanlder = useCallback((searchDataObj) =>{
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
            const currentKeys = Object.keys(search_obj);

            //Ensure if we click on same Sort (example AgeUp) then replace this sort with default "ASC"
            if(currentKeys.includes('sort')){
                //curent sort ecual as new click sort
                //example obj[currentKey] = 'AgeUp' and newValue ='AgeUp'
                if(search_obj['sort'] == newValue){
                    search_obj['sort'] = 'ASC';
                    localStorage.setItem('searchedData', JSON.stringify(search_obj));
                    return search_obj
                }
            }
            if(newKey == 'name' & newValue == ''){
                if(search_obj['name']){
                    delete search_obj.name;
                    // return search_obj;
                } 
            }

            search_obj[newKey] = newValue; //add or update key with value
            localStorage.setItem('searchedData', JSON.stringify(search_obj));
            return search_obj;
        })
        pageNumberRef.current = 0;

    },[]);

    //On every re-rendering this function will be differentand without using useCallback and Filter component will be re-rendered(unnecessary)
    const filterDataHandler = useCallback((filterData) =>{
        //filteredData is passed data from Children Component (Filter)
        console.log("FILTERS IN PARRANET" + JSON.stringify(filterData));
        pageNumberRef.current = 0;
        setFilterData(filterData);
        // alert(" setFilterData(filterData);");

        localStorage.setItem('filteredData', JSON.stringify(filterData));
    },[]);

    const onShowRecommended = ()=>{
        alert("const onShowRecommended = ()=>{");
        console.log("USER: " + JSON.stringify(user));
        if(user?.type === "Client") // ?. -if 'user' exist then user.type can be readed
        {
            setShowRecommended(!showRecommended);
            alert("setShowRecommended(!showRecommended);")
        }
        else
            toast.error("Log in to see recommendetion",{
                className:"toast-contact-message"
            })
    }

    return {data, loading, pageNumberRef, recommended, showRecommended, onShowRecommended, searchDataHanlder, filterDataHandler}
}

export default useClient;