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

    //LIMIT IF IS GUEST 
    console.log("SOCKET " + socket);
    const {user} = useSelector((state) => state.auth);
    const {data, loading, searchDataHanlder, filterDataHandler } = useClient(user);
    const [houseworkerData, setHouseworkerData] = useState([]);

    const [buttonState, setButtonState] = useState({showButton:false, delayedHide:false});

    //event listener for showing button when is Y: +100px view
    const handleScroll = useCallback(() =>{
        if(window.scrollY >= 1000){
            setButtonState({showButton:true, delayedHide:false})
        }
        else{
            setButtonState((prev => ({...prev, delayedHide:true})));
        }
    },[]);

    
    const scrollToTop = () =>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
    }

    //Without useTransition 
    //(applied fade out effect on scroll button div - after some time)
    useEffect(()=>{
        let timeout;

        if(buttonState.delayedHide){
            // Apply fade-out class after a short delay when showButton becomes false
            timeout = setTimeout(() =>{
                setButtonState({showButton:false, delayedHide:false})
            },400)
        }
        return () =>{
            clearTimeout(timeout);
        }
    },[buttonState.delayedHide])//when is window/scrollY triggered

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
        let houseworkerList;
        data  ? 
        houseworkerList = data.map(user =>
            <>
            {console.log("ID::: " + user.id)}
            <HouseworkerCard
                recommended={user.recommended}
                // recommended={user.recommended}
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
            }
    },[data]);

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
                
                <div className="houseworker-list">    
                    {loading ? <Spinner/> :
                    <>
                        {houseworkerData.length > 0 ? houseworkerData : <h3 id='none'>No Matches</h3> }
                    </>
                    }
                </div>   
                       
            </div>

            {buttonState.showButton && 
                <div className='scroll-div'>
                    <button className={`scroll-to-top ${!buttonState.delayedHide ? 'fade-in' : 'fade-out'}`} onClick={scrollToTop}><KeyboardDoubleArrowUpIcon/></button>
                </div>
            }
        </div>
    )
    
}

export default ClientHome