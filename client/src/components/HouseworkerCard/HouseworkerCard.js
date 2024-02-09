import React, {memo} from 'react';
import {useSelector} from 'react-redux'
import axios from 'axios';
import HouseworkerCardContent from './HouseworkerCardContent.js';
import useHouseworkerComment from '../../hooks/Houseworker/useHouseworkerComment.js'
import useHouseworkerRating from '../../hooks/Houseworker/useHouseworkerRating.js';
import useHouseworkerContact from '../../hooks/Houseworker/useHouseworkerContact.js';

axios.defaults.withCredentials = true

const LazyHouseworkerCardContent = React.lazy(() => import('./HouseworkerCardContent'));

//@Todo //Custom Hook for useFetch
const HouseworkersCard = (props) =>{
    const socket = props.socket;
    const userAuth = useSelector((state) => state.auth.user)
    const isClient = userAuth && userAuth.type === "Client";
    const clientUsername = userAuth?.username;
    const clientID = userAuth?.userID;

    console.log("HOUSEWROERK-CARD-ID: " + props.id);


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
    

    //Here the houseworkerProfessions is fetched as well
    const {
        rate, 
        houseworkerRating,
        houseworkerProfessions,
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


    //FIRST IS SHOWNED ALL CARDS WITHOUT PROFESSIONS AND AFTER THAT AGAIN ALL CARD IS RE-RENDERED WITH FETCHED PROFESSIONS
    // const [professions, setProfessions] = useState([]);
    // const fetchProfessions = async() =>{
    //     // const professionsArray = await getProfessions(props.username);
    //     const professionsArray = await getProfessionsByUsername(props.username);
    //     setProfessions(professionsArray);
    //     //alert('setProfessions(professionsArray);')
    // }
    // WAIT FOR ALL CUSTOM HOOKS(async calles to be done)
    // useEffect(() => {
    //     // Use Promise.all to wait for all custom hooks to finish fetching
    //     //when is ratingIntialize()async operation(also fetchProfessions)done then the setLoading will be set to false
    //     Promise.all([ratingInitialize(), fetchProfessions()]).then(() => {
    //       setLoading(false);
    //     });
    // }, []);

    return (
        <>
            { houseworkerRating &&
                <HouseworkerCardContent 
                // <LazyHouseworkerCardContent
                    houseworkerUsername ={houseworkerUsername}
                    comments ={comments}
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
            />      
            }
        </>
    )
}

//optimization
//memo ensures that houseworker that exist(rendered) are not re-render again(because their context(props) are not changing) 
export default memo(HouseworkersCard); 