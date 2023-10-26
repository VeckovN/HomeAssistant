import {useEffect, useState, useRef} from 'react';
import {useSelector} from 'react-redux'
import axios from 'axios';
import HouseworkerCardContent from './HouseworkerCardContent.js';
import useHouseworkerComment from '../../../../../hooks/Houseworker/useHouseworkerComment.js'
import useHouseworkerRating from '../../../../../hooks/Houseworker/useHouseworkerRating.js';
import useHouseworkerContact from '../../../../../hooks/Houseworker/useHouseworkerContact.js';

//import './HouseworkerCard.css'
import '../../../../../sass/components/_houseworkerCard.scss';
import {getProfessionsByUsername} from '../../../../../services/houseworker.js'

axios.defaults.withCredentials = true


//CLIENT - Serach, Filter, HouseworkersCard(wiht paggination)
//GUEST sees everything just like THE CLIENT but 
// -can't see all information(Working hours, Rating) and cant send message and post comment


//@Todo //Custom Hook for useFetch
const HouseworkersCard = (props) =>{
    const socket = props.socket;

    const userAuth = useSelector((state) => state.auth.user)
    const isClient = userAuth && userAuth.type === "Client";
    const clientUsername = userAuth?.username;
    const clientID = userAuth?.userID;

    const {
        comments, 
        postCommentRef, 
        commentClick, 
        houseworkerUsername, 
        onCommentHandler, 
        onCommentSubmit, 
        onCommentDelete,
        onCloseComment
    } = useHouseworkerComment(socket, isClient, clientUsername)
    
    const {
        rate, 
        rating,
        showRateInput, 
        showRateInputCssClass, 
        onRateHandler, 
        onCloseRateHandler, 
        onChangeRate
    } = useHouseworkerRating(socket, isClient, clientUsername, props.username);
    
    const {
        contactMessageRef,
        onContactHandler
    } = useHouseworkerContact(socket, isClient, clientID, clientUsername)

    const [professions, setProfessions] = useState([]);
    const fetchProfessions = async() =>{
        // const professionsArray = await getProfessions(props.username);
        const professionsArray = await getProfessionsByUsername(props.username);
        setProfessions(professionsArray);
    }

    //useCallback used instead useMemo to prevent unnecessary re-renders
    // const fetchRatingCal = useCallback( async ()=>{
    //     try{
    //         const result = await axios.get(`http://localhost:5000/api/houseworker/rating/${props.username}`)
    //         const ratingValue = result.data;
    //         //console.log("RATING: " + JSON.stringify(ratingValue));
    //         setRating(ratingValue);
    //         console.log('RATING FETCHING');
    //     }
    //     catch(error){
    //         console.log("Error: " + error);
    //     }
    // },[props.username])

    useEffect(()=>{
        // fetchRating();
        fetchProfessions(); 
    },[])


    return (
       <HouseworkerCardContent 
            houseworkerUsername ={houseworkerUsername}
            comments ={comments}
            onCommentSubmit ={onCommentSubmit}
            postCommentRef ={postCommentRef}
            onCommentDelete={onCommentDelete}
            onCloseComment = {onCloseComment}
            houseworkerProps={props}
            isClient={isClient}
            clientUsername={clientUsername}
            professions={professions}
            rating={rating}
            showRateInput={showRateInput}
            rate={rate}
            onChangeRate={onChangeRate}
            onCloseRateHandler={onCloseRateHandler}
            onRateHandler={onRateHandler}
            showRateInputCssClass={showRateInputCssClass}
            onCommentHandler={onCommentHandler}
            contactMessageRef={contactMessageRef}
            onContactHandler={onContactHandler}
            commentClick={commentClick}
       />      
    )

}

export default HouseworkersCard