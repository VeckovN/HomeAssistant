import {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {getRating, getCommentsCount, getConversationCount} from '../../../services/houseworker.js'


import './HouseworkerHome.css'

const HouseworkerHome = () =>{

    const {user} = useSelector((state) => state.auth)
    const [rating, setRating] = useState('');
    const [commentsCount, setCommentsCount] = useState('');
    const [conversationCount, setConversationCount] = useState('');

    const fetchRating = async() =>{
        //have to use await because getRating calling async function (axios request)
        const ratingValue = await getRating(user.username); 
        setRating(ratingValue.toFixed(1));
    }   
    const fetchCommentsCount = async() => {
        const count = await getCommentsCount(user.username);
        setCommentsCount(count)
        
    }
    const fetchConversationCount = async() =>{
        const count = await getConversationCount(user.userID);
        setConversationCount(count);
    }

    useEffect(()=>{
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