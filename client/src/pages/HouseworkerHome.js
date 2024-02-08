import {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {getConversationCount, getHomeInfo} from '../services/houseworker.js'
import Spinner from '../components/UI/Spinner.js';
import { logout } from '../store/auth-slice.js';
import HouseworkerProfessionItem from '../components/HouseworkerProfessionItem.js';
import GradeIcon from '@mui/icons-material/Grade';

import '../sass/pages/_houseworkerHome.scss';

const HouseworkerHome = () =>{

    const {user} = useSelector((state) => state.auth)
    const [conversationCount, setConversationCount] = useState('');
    const [homeInfo, setHomeInfo] = useState({});
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();

    //Spinner should be showned until these 3 functions are executed
    //PromisAll will solve this problem(garantees that after executing all these func the loading state is changed  )
    const fetchData = async () =>{
        try{
            const [countConv, homeInfo] = await Promise.all([
                getConversationCount(user.userID),
                getHomeInfo(user.username),
            ]);
            
            setConversationCount(countConv);
            setHomeInfo(homeInfo);
        }catch(err){
            console.log("Error Durgin fetching PromisAll data")
        }finally{ //after all funcs executions
            setLoading(false);
        }
    }

    useEffect(()=>{
       fetchData();
    },[])

    const logoutHandler = () =>{
        //emit disconnected socket
        dispatch(logout());
        setShowMenu(false);
    }

    return (

        <div className='page-conainer'>
            {loading ? <Spinner className='profile-spinner'/> :
            <main className='houseworker-container'>
                <header className='header-loggout'>
                    <button onClick={logoutHandler} className='logout-button'>Logout</button>
                </header>

                <section className='info-client-section'>       
                    <div className='info-content-container'>
                        <div className='title-text-container'> 
                            <div>Over The <span>300+</span> potential</div>
                            <div>Clients looking for you</div>
                        </div>

                        <div className='other-info'> 
                            <div>
                                Your job is just to wait for contact with the client, and
                                then your journey begins
                            </div>
                        </div>                        
                    </div>

                    <div className='image-container'>
                        <div>Image</div>
                    </div>

                </section>

                <section className='insight-info-section'>
                    <div className='welcome-and-rating'>
                        <div className='welcome'>
                            <div id='first-message'>Hello <span>Sara</span></div>
                            <div>Here is your profile insight</div>
                        </div>

                        <div className='rating-box'>
                            {/* <div>Your rate</div> */}
                            <div className='rate-box-container'>
                                <div id='rate-label'>Your rate</div>
                                <div className='rate-box'>
                                    <div className='rate'>5<span><GradeIcon fontSize='inherit'/></span></div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="insight-container">
                        <div className='insight-card'>
                            <div className='count-info'>{conversationCount}</div>
                            <div className='desc-info'>Conversation with clients</div>
                        </div>
                        <div className='insight-card'>
                            <div className='count-info'>{homeInfo.commentCount}</div>
                            <div className='desc-info'>Comments</div>
                        </div>
                        <div className='insight-card'>
                            <div className='count-info'>{homeInfo?.professions ? Object.keys(homeInfo.professions).length : 'Null'}</div>
                            <div className='desc-info'>Professions that you offer</div>
                        </div>
                       
                    </div>

                </section>

                <section className='professions-section'>

                    <div className='professions-section-title'>
                        You can always change your professions offering 
                    </div>

                    <div className='profile-professions-container'>
                        {/* make component for each profession */}
                            {homeInfo.professions.map( el => (
                                <HouseworkerProfessionItem professionTitle={el}/>
                            ))}
                    </div>
                </section>
            </main>
            }
        </div>
    )



 
    // return (
    //     <div className='houseworker-container'>
    //         {loading ? <Spinner className='profile-spinner'/> :
    //         <>
    //             <div className='houseworker-one'>
    //                 <HouseworkerItem 
    //                     title='Rating'
    //                     icon={<GradeIcon fontSize='inherit'/>}
    //                     count={homeInfo.avgRating}
    //                 />
    //             </div>

    //             <div className ='houseworker-item-container'>
    //                 <div id='houseworker-item-label'>Profile Insights</div>
    //                     <HouseworkerItem 
    //                         title='Conversations'
    //                         icon={<QuestionAnswerIcon fontSize='inherit'/>}
    //                         count={conversationCount}
    //                         link={'/messages'}
    //                     />

    //                     <HouseworkerItem 
    //                         title='Comments'
    //                         icon={<CommentIcon fontSize='inherit'/>}
    //                         count={homeInfo.commentCount}
    //                         link={'/comments'}
    //                     />

    //                     <HouseworkerItem 
    //                         title='Professions'
    //                         icon={<BadgeIcon fontSize='inherit'/>}
    //                         count={homeInfo.professionCount}
    //                         link={'/profile'}
    //                     />
    //             </div>

    //         </>
    //         }
    //     </div>
    // )
}

export default HouseworkerHome