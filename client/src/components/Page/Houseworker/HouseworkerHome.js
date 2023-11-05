import {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import {getRating, getCommentsCount, getConversationCount} from '../../../services/houseworker.js'
import Spinner from '../../UI/Spinner.js';

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
                getConversationCount(user.userID)
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
                <div className ='houseworker-item-container'>
                    <div className ='houseworker-item'>
                        <div className='item-title'>
                            <label>Chat</label>
                            <div>IKONICA</div>
                        </div>
                        
                        <div className='item-info'>{conversationCount}</div>
                    </div>

                    <div className ='houseworker-item'>
                        <div className='item-title'>
                            <label>Rating</label>
                            <div>IKONICA</div>
                        </div>

                        <div className='item-info'>{rating}</div>
                    </div>

                    <div className ='houseworker-item'>
                        <div className='item-title'>
                            <label>Comments</label>
                            <div>IKONICA</div>
                        </div>
                        
                        <div className='item-info'>{commentsCount}</div>
                    </div>
                </div>
            </>
            }
        </div>
    )
}

export default HouseworkerHome