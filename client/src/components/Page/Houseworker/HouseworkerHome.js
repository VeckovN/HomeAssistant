import {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import {getRating, getCommentsCount, getConversationCount, getProfessions} from '../../../services/houseworker.js'
import Spinner from '../../UI/Spinner.js';

import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import GradeIcon from '@mui/icons-material/Grade';
import CommentIcon from '@mui/icons-material/Comment';
import BadgeIcon from '@mui/icons-material/Badge';

import HouseworkerItem from './HouseworkerItem.js';
import '../../../sass/pages/_houseworkerHome.scss';

const HouseworkerHome = () =>{

    const {user} = useSelector((state) => state.auth)
    const [rating, setRating] = useState('');
    const [commentsCount, setCommentsCount] = useState('');
    const [conversationCount, setConversationCount] = useState('');
    const [loading, setLoading] = useState(true);

    //Spinner should be showned until these 3 functions are executed
    //PromisAll will solve this problem(garantees that after executing all these func the loading state is changed  )

    const fetchData = async () =>{
        try{
            const [ratingValue, count, countConv] = await Promise.all([
                getRating(user.username),
                getCommentsCount(user.username),
                getConversationCount(user.userID),
                // getProfessionsOfferCount(user.userID),
            ]);

            setRating(ratingValue.toFixed(1));
            setCommentsCount(count)
            setConversationCount(countConv);
        }catch(err){
            console.log("Error Durgin fetching PromisAll data")
        }finally{ //after all funcs executions
            setLoading(false);
        }
    }
    // const fetchRating = async() =>{
    //     const ratingValue = await getRating(user.username); 
    //     setRating(ratingValue.toFixed(1));
    // }   
    // const fetchCommentsCount = async() => {
    //     const count = await getCommentsCount(user.username);
    //     setCommentsCount(count)   
    // }
    // const fetchConversationCount = async() =>{
    //     const countConv = await getConversationCount(user.userID);
    //     setConversationCount(countConv);
    // }

    useEffect(()=>{
       fetchData();
    },[])
 
    return (
        <div className='houseworker-container'>
            {loading ? <Spinner/> :
            <>
                <div className='houseworker-one'>
                    <HouseworkerItem 
                        title='Rating'
                        icon={<GradeIcon fontSize='inherit'/>}
                        count={rating}
                    />
                </div>

                <div className ='houseworker-item-container'>
                    <div id='housewokre-item-label'>Profile Insights</div>
                    
                    <HouseworkerItem 
                        title='Conversations'
                        icon={<QuestionAnswerIcon fontSize='inherit'/>}
                        count={conversationCount}
                        link={'/messages'}
                    />

                    <HouseworkerItem 
                        title='Comments'
                        icon={<CommentIcon fontSize='inherit'/>}
                        count={commentsCount}
                        link={'/comments'}
                    />

                    <HouseworkerItem 
                        title='Professions'
                        icon={<BadgeIcon fontSize='inherit'/>}
                        count={3}
                        link={'/profile'}
                    />
                </div>

            </>
            }
        </div>
    )
}

export default HouseworkerHome