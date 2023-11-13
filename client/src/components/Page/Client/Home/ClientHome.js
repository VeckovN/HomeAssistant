import {useState, useEffect, useCallback} from 'react'
import useClient from '../../../../hooks/useClient.js';
import HouseworkerCard from './HouseworkerCard/HouseworkerCard.js'
import Filter from './Filter/Filter.js';
import { useSelector } from 'react-redux';
import Search from './SearchAndSort/Search.js';
import Sort from './SearchAndSort/Sort.js';
import Spinner from '../../../UI/Spinner.js';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';


import '../../../../sass/pages/_clientHome.scss';

const ClientHome = ({socket}) =>{
    console.log("clientHome Redner");
    // alert("CL RP 1");

    //LIMIT IF IS GUEST 
    console.log("SOCKET " + socket);

    const [showButton ,setShowButton] = useState(false);
    const {user} = useSelector((state) => state.auth);
    const {data, loading, recommended, showRecommended, onShowRecommended, searchDataHanlder, filterDataHandler } = useClient(user);
    const [houseworkerData, setHouseworkerData] = useState([]);

    //alert("After; useClient")
    // console.log("DATA: " , data);

    //event listener for showing button when is Y: +100px view
    const handleScroll = useCallback(() =>{
        if(window.scrollY >= 1000){
            setShowButton(true);
        }
        else{            
            setShowButton(false)
        }
    },[]);

    
    const scrollToTop = () =>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
    }

    useEffect(()=>{
        window.addEventListener('scroll', handleScroll);
        return () =>{
            window.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]); //put handleScroll as dependecies -> it will be applied only one times 
    //because using useCallback its creating(freezing) only one copy of that function

    console.log("DATA: " , data);

    //THIS CAUSED RE_RENDERING ON EVERY DATA CHANGE ITS CHANGE  setHouseworkerData(houseworkerList); THAT AGAIN CAUSE RE_REDNERING
    useEffect(()=>{
        //alert("useEffect(()=>{ let houseworkerList;")
        let houseworkerList;
        data  ? 
        // data ? 
        houseworkerList = data.map(user =>
            <>
            {console.log("ID::: " + user.id)}
            {/* {console.log("DATA: \n " + JSON.stringify(data))} */}
            <HouseworkerCard
                recommended={false}
                socket={socket}
                key={user.id}
                id={user.id}
                username={user.username}
                email={user.email}
                first_name={user.first_name}
                last_name={user.last_name}
                description={user.description}
                picturePath={user.picturePath}
                gender={user.gender}
                city={user.city}
                address={user.address}
                age={user.age}
                phone_number={user.phone_number}
                professions={user.professions}
            />
            </>
            )
            : houseworkerList =[]       

            if(houseworkerList?.length >0){
                setHouseworkerData(houseworkerList);
                //alert("setHouseworkerData(houseworkerList);");
            }
    },[data]);

    // //RECOMMENDED USERS
    // let recommendedList;
    // {recommended ? 
    //     recommendedList = recommended.map(user =>
    //         <>
    //         {console.log("ID::: " + user.id)}
    //         <HouseworkerCard
    //             recommended={true}
    //             socket={socket}
    //             key={user.id}
    //             id={user.id}
    //             username={user.username}
    //             email={user.email}
    //             first_name={user.first_name}
    //             last_name={user.last_name}
    //             description={user.description}
    //             picturePath={user.picturePath}
    //             gender={user.gender}
    //             city={user.city}
    //             address={user.address}
    //             age={user.age}
    //             phone_number={user.phone_number}
    //             professions={user.professions}
    //         />
    //         </>
    //         )
    //         : recommendedList =[]
    // }

    // //HOUSEWORKER USERS
    // let houseworkerList;
    // {data ? 
    //     houseworkerList = data.map(user =>
    //         <>
    //         {console.log("ID::: " + user.id)}
    //         <HouseworkerCard
    //             recommended={false}
    //             socket={socket}
    //             key={user.id}
    //             id={user.id}
    //             username={user.username}
    //             email={user.email}
    //             first_name={user.first_name}
    //             last_name={user.last_name}
    //             description={user.description}
    //             picturePath={user.picturePath}
    //             gender={user.gender}
    //             city={user.city}
    //             address={user.address}
    //             age={user.age}
    //             phone_number={user.phone_number}
    //             professions={user.professions}
    //         />
    //         </>
    //         )
    //         : houseworkerList =[]
    // }

    return (
        <div className='home-container'>
            <div className='search-box'>
                <Search search={searchDataHanlder}></Search>
                <Sort search={searchDataHanlder}></Sort>
            </div>
            <div className='filter-houseworkers-container'>
                <div className='filter-options'>
                    <Filter 
                    //This FilterDataHandler is different on every render by default - so memo(Filter) won't work to prevent Filter unnecessary re-rendering
                    //so i had to this filterDataHandler made unique (frize on first fucntion creating -> useCallback on filterDataHandler in useClient )
                        filterOptions={filterDataHandler}
                    />
                </div>
                
                {/* <button className="recommended-btn" onClick={onShowRecommended}>{!showRecommended ? 'Show recommended' : 'Close Recommended'}</button> */}
                
                
                <div className="houseworker-list">    
                    {loading ? <Spinner/> :
                    <>
                        {/* {showRecommended && recommendedList } */}
                        {/* {houseworkerList.length > 0 ? houseworkerList : <h3 id='none'>No Matches</h3> } */}
                        {houseworkerData.length > 0 ? houseworkerData : <h3 id='none'>No Matches</h3> }
                    </>
                    }
                </div>   
                       
            </div>

            {showButton && 
                <div className='scroll-div'>
                    <button id='scroll-to-top' onClick={scrollToTop}><KeyboardDoubleArrowUpIcon/></button>
                </div>
            }
        </div>
    )
    
}

export default ClientHome