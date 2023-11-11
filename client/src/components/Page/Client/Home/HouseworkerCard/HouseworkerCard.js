import {useEffect, useState, useRef, memo} from 'react';
import {useSelector} from 'react-redux'
import axios from 'axios';
import HouseworkerCardContent from './HouseworkerCardContent.js';
import useHouseworkerComment from '../../../../../hooks/Houseworker/useHouseworkerComment.js'
import useHouseworkerRating from '../../../../../hooks/Houseworker/useHouseworkerRating.js';
import useHouseworkerContact from '../../../../../hooks/Houseworker/useHouseworkerContact.js';
import {getProfessionsByUsername} from '../../../../../services/houseworker.js'

axios.defaults.withCredentials = true

//CLIENT - Serach, Filter, HouseworkersCard(wiht paggination)
//GUEST sees everything just like THE CLIENT but 
// -can't see all information(Working hours, Rating) and cant send message and post comment


//EVERY HOUSEWORKER CARD DO THIS - IT WILL BE AGAIN RE-RENDER WHEN is CLIENTHOME COMPONENT RENDER -
//AND SHOWNED CARD WILL BE AGAIN RE-RENDERED 

//@Todo //Custom Hook for useFetch
const HouseworkersCard = (props) =>{
    // alert("RENDER: " + props.first_name);
    console.log("RENDER: " + props.first_name) ;
    // console.log("Props: \n", JSON.stringify(props));
    // alert("RE " + props);
    const socket = props.socket;

    const userAuth = useSelector((state) => state.auth.user)
    const isClient = userAuth && userAuth.type === "Client";
    const clientUsername = userAuth?.username;
    const clientID = userAuth?.userID;

    const [loading, setLoading] = useState(true);

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
        ratingInitialize, 
        onRateHandler, 
        onCloseRateHandler, 
        onChangeRate
    } = useHouseworkerRating(socket, isClient, clientUsername, props.username);
    
    const {
        contactMessageRef,
        onContactHandler
    } = useHouseworkerContact(socket, isClient, clientID, clientUsername)


    //FIRST IS SHOWNED ALL CARDS WITHOUT PROFESSIONS AND AFTER THAT AGAIN ALL CARD IS RE-RENDERED WITH FETCHED PROFESSIONS
    const [professions, setProfessions] = useState([]);
    const fetchProfessions = async() =>{
        // const professionsArray = await getProfessions(props.username);
        const professionsArray = await getProfessionsByUsername(props.username);
        setProfessions(professionsArray);
        //alert('setProfessions(professionsArray);')
        console.log("setProfessions(professionsArray);");
    }


    //WAIT FOR ALL CUSTOM HOOKS(async calles to be done)
    useEffect(() => {
        // Use Promise.all to wait for all custom hooks to finish fetching
        //when is ratingIntialize()async operation(also fetchProfessions)done then the setLoading will be set to false
        Promise.all([ratingInitialize(), fetchProfessions()]).then(() => {
          setLoading(false);
        });
    }, []);

    // if(rating !=='')
    //     console.log("RATING EXIST")
    // else{
    //     console.log("RATING NOONE")
    // }
    

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

    // useEffect(()=>{
    //     // fetchRating();
    //     fetchProfessions(); 
    // },[])

    return (
        <>
            { !loading &&
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
            }
        </>
    )
}

//BIG OPTIMIZATION OPTIMIZATION
//memo ensures that houseworker that exist(rendered) are not re-render again(because their context(props) are not changing) 
export default memo(HouseworkersCard); 