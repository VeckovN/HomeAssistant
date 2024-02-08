import {useState, useEffect} from 'react'
import { useSelector } from 'react-redux';
import useClient from '../hooks/useClient.js';
import HouseworkerCard from '../components/HouseworkerCard/HouseworkerCard.js'
import Filter from '../components/Filter/Filter.js';
import Search from '../components/Search.js';
import Sort from '../components/Sort.js';
import Spinner from '../components/UI/Spinner.js';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import '../sass/pages/_clientHome.scss';

const ClientHome = ({socket}) =>{
    //LIMIT IF IS GUEST 
    console.log("SOCKET " + socket);
    const {user} = useSelector((state) => state.auth);
    const {data, loading, setLoading, searchDataHanlder, filterDataHandler } = useClient(user);
    // const {data, searchDataHanlder, filterDataHandler } = useClient(user);
    const [houseworkerData, setHouseworkerData] = useState([]); //List of HouseworkerCard
    const [buttonState, setButtonState] = useState({showButton:false, delayedHide:false});


    const scrollToTop = () =>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        
        setButtonState()
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

    console.log("DATA: " , data);
    //THIS CAUSED RE_RENDERING ON EVERY DATA CHANGE ITS CHANGE  setHouseworkerData(houseworkerList); THAT AGAIN CAUSE RE_REDNERING
    useEffect(()=>{
        let houseworkerList;
        data ? 
        houseworkerList = data.map(user =>
            <>
            {console.log("ID::: " + user.id)}
            <HouseworkerCard
                recommended={user.recommended}
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
            setHouseworkerData(houseworkerList)
    },[data]);

    return (
        <main className='home-container'>

            <section className='info-section'>
                <div className='info'>
                    Find People that can help you in your daily Home jobs
                </div>
                
                <div className='users-count-message'>
                 <span>1029</span> Currently Users registerd That Offer Jobs
                </div>
            </section>

            <section className='houseworker-content-section'>
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
                            {houseworkerData.length > 0 ? houseworkerData : <h3 id='no-matches'>No Found Housewokrers</h3> }
                        </>
                        }   
                    </div>   
                        
                </div>

                {buttonState.showButton && 
                    <div className='scroll-div'>
                        <button className={`scroll-to-top ${!buttonState.delayedHide ? 'fade-in' : 'fade-out'}`} onClick={scrollToTop}><KeyboardDoubleArrowUpIcon/></button>
                    </div>
                }
            </section>
        </main>
    )
    
}

export default ClientHome