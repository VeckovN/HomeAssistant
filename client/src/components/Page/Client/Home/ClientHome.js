import {useState, useEffect} from 'react'
import useClient from '../../../../hooks/useClient.js';
import HouseworkerCard from './HouseworkerCard/HouseworkerCard.js'
import Filter from './Filter/Filter.js';
import SearchAndSort from './SearchAndSort/SearchAndSort.js';
import { useSelector } from 'react-redux';

//import './ClientHome.css'
import '../../../../sass/pages/_clientHome.scss';

const ClientHome = ({socket}) =>{

    //LIMIT IF IS GUEST 
    console.log("SOCKET " + socket);

    const [showButton ,setShowButton] = useState(false);
    const {user} = useSelector((state) => state.auth)
    const {data, recommended, showRecommended, onShowRecommended, searchDataHanlder, filterDataHandler } = useClient(user);


    useEffect(()=>{
        window.addEventListener('scroll', handleScroll);

        return () =>{
            window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    //event listener for showing button when is Y: +100px view
    const handleScroll = () =>{
        if(window.scrollY >= 1000)
            setShowButton(true);
        else
            setShowButton(false)
    }
    
    const scrollToTop = () =>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
    }


    //RECOMMENDED USERS
    let recommendedList;
    {recommended ? 
        recommendedList = recommended.map(user =>
            <>
            {console.log("ID::: " + user.id)}
            <HouseworkerCard
                recommended={true}
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
            : recommendedList =[]
    }

    //HOUSEWORKER USERS
    let houseworkerList;
    {data ? 
        houseworkerList = data.map(user =>
            <>
            {console.log("ID::: " + user.id)}
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
    }

    return (
        <div className='home-container'>
                <button className="recommended-btn" onClick={onShowRecommended}>{!showRecommended ? 'Show recommended' : 'Close Recommended'}</button>
                <SearchAndSort search={searchDataHanlder}/>
                <div className='filter-houseworkers-container'>
                    <Filter 
                    //This FilterDataHandler is different on every render by default - so memo(Filter) won't work to prevent Filter unnecessary re-rendering
                    //so i had to this filterDataHandler made unique (frize on first fucntion creating -> useCallback on filterDataHandler in useClient )
                        filterOptions={filterDataHandler}
                    />
                    <div className="houseworker-list">
                        {showRecommended && recommendedList}
                        {houseworkerList.length > 0 ? houseworkerList : <h3>No Matches</h3> }
                    </div>
                </div>

                {showButton && 
                    <div className='scroll-div'>
                        <button className='scroll-to-top' onClick={scrollToTop}>Scroll To Top</button>
                    </div>
                }
        </div>
    )
    
}

export default ClientHome