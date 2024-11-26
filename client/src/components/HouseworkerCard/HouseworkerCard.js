import React, {useState, useRef} from 'react';
import {useSelector} from 'react-redux'
import axios from 'axios';
import HouseworkerCardContent from './HouseworkerCardContent.js';
import useHouseworkerRating from '../../hooks/Houseworker/useHouseworkerRating.js';
import useHouseworkerContact from '../../hooks/Houseworker/useHouseworkerContact.js';

axios.defaults.withCredentials = true;

const HouseworkersCard = (props) =>{
    const socket = props.socket;
    const userAuth = useSelector((state) => state.auth.user)
    const isClient = userAuth && userAuth.type === "Client";
    const clientUsername = userAuth?.username;
    const clientID = userAuth?.userID;

    //houseworker which comment modal is showned
    const [houseworker, setHouseworker] = useState({
        username:'',
        id:''
    })
    const commentClick = useRef(false);

    const onCommentHandler = (e) =>{
        if(!isClient){
            toast.error("You must be logged in",{
                className:"toast-contact-message"
            })
            return 
        }
        setHouseworker({
            username:e.target.value,
            id:e.target.id
        })
        commentClick.current = true;
    }

    const onCloseComment = ()=>{
        setHouseworker(prevState =>({
            ...prevState,
            username:''
        }))
        commentClick.current = false;
        // pageNumberRef.current = 0;
    }
    
    const {
        rate, 
        houseworkerRating,
        houseworkerProfessions,
        loadingRating,
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

    if(!loadingRating){
        return (
            <>
                <HouseworkerCardContent 
                    socket={socket}
                    houseworkerProps={props}
                    isClient={isClient}
                    clientUsername={clientUsername}
                    houseworkerRating={houseworkerRating}
                    houseworkerProfessions={houseworkerProfessions}
                    showRateInput={showRateInput}
                    rate={rate}
                    onChangeRate={onChangeRate}
                    onCloseRateHandler={onCloseRateHandler}
                    onRateHandler={onRateHandler}
                    showRateInputCssClass={showRateInputCssClass}
                    clickedHouseworker={houseworker}
                    onCommentHandler={onCommentHandler}
                    contactMessageRef={contactMessageRef}
                    onContactHandler={onContactHandler}
                    onCloseComment={onCloseComment}
                    commentClick={commentClick}
                />
            </>
        )
    }
}

export default HouseworkersCard;