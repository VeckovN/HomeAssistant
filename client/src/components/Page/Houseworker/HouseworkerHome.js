import {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';


import './HouseworkerHome.css'

const HouseworkerHome = () =>{


    const {user} = useSelector((state) => state.auth)
    const [rating, setRating] = useState('');
    const [commentsCount, setCommentsCount] = useState('');
    const [conversationCount, setConversationCount] = useState('');


    const fetchRating = async() =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/rating/${user.username}`)
        const ratingValue = result.data;
        //console.log("RATING: " + JSON.stringify(ratingValue));
        setRating(ratingValue.toFixed(1));
    }   
    const fetchCommentsCount = async() => {
        const result = await axios.get(`http://localhost:5000/api/houseworker/comments/count/${user.username}`)
        const count = result.data;
        setCommentsCount(count)
        
    }
    const fetchConversationCount = async() =>{
        const result = await axios.get(`http://localhost:5000/api/chat/conversationCount/${user.userRedisID}`)
        const count = result.data;
        setConversationCount(count);
    }
    


    useEffect( ()=>{
        fetchRating();
        fetchCommentsCount();
        fetchConversationCount();
    })

 
    
    //Take numb of ChatRooms

    //take Numb of Comments

    return (
        <div className='houseworker_container'>

            <div className ='houseworker_item_container'>
                <div className ='houseworker_item'>
                    <div className='item_title'>
                        <label>Chat</label>
                        <div>IKONICA</div>
                    </div>
                    
                    <div className='item_info'>{conversationCount}</div>
                </div>

                <div className ='houseworker_item'>
                    <div className='item_title'>
                        <label>Rating</label>
                        <div>IKONICA</div>
                    </div>

                    <div className='item_info'>{rating}</div>
                </div>

                <div className ='houseworker_item'>
                    <div className='item_title'>
                        <label>Comments</label>
                        <div>IKONICA</div>
                    </div>
                    
                    <div className='item_info'>{commentsCount}</div>
                </div>
            </div>
        </div>
    )
}

export default HouseworkerHome