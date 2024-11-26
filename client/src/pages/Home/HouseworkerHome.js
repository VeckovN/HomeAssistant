import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {getConversationCount, getHomeInfo} from '../../services/houseworker.js'
import Spinner from '../../components/UI/Spinner.js';
import HouseworkerProfessionItem from '../../components/HouseworkerProfessionItem.js';
import GradeIcon from '@mui/icons-material/Grade';

import '../../sass/pages/_houseworkerHome.scss';

const HouseworkerHome = () =>{
    const {user} = useSelector((state) => state.auth)
    const [conversationCount, setConversationCount] = useState('');
    const [homeInfo, setHomeInfo] = useState({});
    const [loading, setLoading] = useState(true);

    //Spinner should be showned until these 3 functions are executed
    const fetchData = async () =>{
        try{
            const [countConv, homeInfo] = await Promise.all([
                getConversationCount(user.userID),
                getHomeInfo(user.username),
            ]);
            setConversationCount(countConv);
            setHomeInfo(homeInfo);
        }catch(err){
            console.error("Error during fetching PromisAll data")
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
       fetchData();
    },[])

    return (

        <div className='page-conainer'>
            {loading ? <Spinner className='profile-spinner'/> :
            <main className='houseworker-container'>
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
                            <div id='first-message'>Hello <span>{user.username}</span></div>
                            <div>Here is your profile insight</div>
                        </div>

                        <div className='rating-box'>
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
                            {homeInfo.professions?.map( el => (
                                <HouseworkerProfessionItem professionTitle={el} key={`pr-${el}`}/>
                            ))}
                    </div>
                </section>
            </main>
            }
        </div>
    )

}

export default HouseworkerHome