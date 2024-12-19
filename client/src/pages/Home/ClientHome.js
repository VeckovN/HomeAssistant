import {useState, useEffect, useRef} from 'react'
import {useSelector} from 'react-redux';
import useClient from '../../hooks/useClient.js';
import HouseworkerCard from '../../components/HouseworkerCard/HouseworkerCard.js'
import { getHouseworkersCount } from '../../services/houseworker.js';
import Filter from '../../components/Filter/Filter.js';
import Search from '../../components/Search.js';
import Sort from '../../components/Sort.js';
import Spinner from '../../components/UI/Spinner.js';
import ScrollToTopHome from '../../utils/ScrollToTopHome.js';
import '../../sass/pages/_clientHome.scss';

const ClientHome = ({socket}) =>{
    const {user} = useSelector((state) => state.auth);
    const {data, loading, searchDataHanlder, filterDataHandler } = useClient(user);
    const [houseworkerData, setHouseworkerData] = useState([]); //List of HouseworkerCard
    const [houseworkerCount, setHouseworkerCount] = useState([]);
    const scrollElemenetRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    const scrollToElemementHandler = ()=>{
        scrollTimeoutRef.current = setTimeout(()=>{
            if(scrollElemenetRef.current){
                scrollElemenetRef.current.scrollIntoView({
                    top:0,
                    behavior:'smooth'
                });
            }
        },300)
    }

    const searchDataHanlderWithScroll = (prop) =>{
        scrollToElemementHandler();
        searchDataHanlder(prop)
    }
    const filterDataHanlderWithScroll = (prop) =>{
        scrollToElemementHandler();
        filterDataHandler(prop)
    }

    const fetchHouseworkerCount = async() =>{
        try{
            const houseworkerResult = await getHouseworkersCount();
            const count = houseworkerResult.count;
            setHouseworkerCount(count);
        }
        catch(err){
            console.error(err);
        }
    }

    useEffect(()=>{
        let houseworkerList;
        data ? 
        houseworkerList = data.map((user,index) =>
            (
            <HouseworkerCard
                key={`${user.id}-${index}`}
                recommended={user.recommended}
                socket={socket}
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
            />
            )
        )
        : houseworkerList =[]       
            setHouseworkerData(houseworkerList)
    },[data]);

    useEffect(()=>{
        fetchHouseworkerCount();
        return() =>{
            if(scrollTimeoutRef.current){
                clearTimeout(scrollTimeoutRef.current);
            }
        }
    },[])

    return (
        <main className='home-container'>

            <section className='info-section'>
                <div className='info'>
                    Find People that can help you in your daily Home jobs
                </div>
                
                <div className='users-count-message'>
                    <span>{houseworkerCount}</span> Currently Users registerd That Offer Jobs
                </div>
            </section>

            <section className='houseworker-content-section'>
                <div className='search-box'>
                    <Search search={searchDataHanlderWithScroll}></Search>
                    <Sort search={searchDataHanlderWithScroll}></Sort>
                </div>
                <div className='filter-houseworkers-container'>
                    <div className='filter-options'>
                        <Filter 
                            filterOptions={filterDataHanlderWithScroll}
                        />
                    </div>
                    
                    <div ref={scrollElemenetRef} className="houseworker-list">   
                        {loading ? <Spinner/> :
                        <>
                            {houseworkerData &&
                                houseworkerData.length > 0 ? houseworkerData : <h3 id='no-matches'>No Found Housewokrers</h3> 
                            }
                        </>
                        }   
                    </div>   
                </div>

                <ScrollToTopHome/>
            </section>
        </main>
    )
    
}

export default ClientHome