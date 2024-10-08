import React from 'react';
import {useSelector} from 'react-redux'
import axios from 'axios';
import HouseworkerCardContent from './HouseworkerCardContent.js';
import useHouseworkerComment from '../../hooks/Houseworker/useHouseworkerComment.js'
import useHouseworkerRating from '../../hooks/Houseworker/useHouseworkerRating.js';
import useHouseworkerContact from '../../hooks/Houseworker/useHouseworkerContact.js';

axios.defaults.withCredentials = true;

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
        allCommentsLoadedRef,
        houseworkerUsername, 
        onCommentHandler, 
        onCommentSubmit, 
        onCommentDelete,
        onCloseComment,
        onLoadMoreComments
    } = useHouseworkerComment(socket, isClient, clientUsername)
    
    //Here the houseworkerProfessions is fetched as well
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
                    houseworkerUsername ={houseworkerUsername}
                    comments ={comments}
                    allCommentsLoadedRef={allCommentsLoadedRef}
                    onCommentSubmit ={onCommentSubmit}
                    postCommentRef ={postCommentRef}
                    onCommentDelete={onCommentDelete}
                    onCloseComment = {onCloseComment}
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
                    onCommentHandler={onCommentHandler}
                    contactMessageRef={contactMessageRef}
                    onContactHandler={onContactHandler}
                    commentClick={commentClick}
                    onLoadMoreComments={onLoadMoreComments}
                />
            </>
        )
    }
}

//memo ensures that houseworker that exist(rendered) are not re-render again(because their context(props) are not changing) 
//AFTER TESTING 'memo' CAUSES MORE LOAD TIMES THAN WITHOUT IT
// export default memo(HouseworkersCard);
export default HouseworkersCard;