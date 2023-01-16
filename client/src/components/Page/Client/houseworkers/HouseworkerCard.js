import {useEffect, useState, useRef} from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true
import {useSelector} from 'react-redux'
import Modal from '../../../UI/Modal.js'
import CommentItem from '../../../UI/CommentItem'; 
import useSocket from '../../../../hooks/useSocket.js';

//CLIENT - Serach, Filter, HouseworkersCard(wiht paggination)
//GUEST sees everything just like THE CLIENT but 
// -can't see all information(Working hours, Rating) and cant send message and post comment


//@Todo //Custom Hook for useFetch
const HouseworkersCard = (props) =>{

    //we should take client form localStorage isntead taking from redux
    // const user = localStorage.getItem("user");
    // const client = user.type =='client' ? true : false;

    // console.log('IS:: ' + JSON.stringify(user))
    // console.log("BOOL: " + client);
    
    //comments of houseworker's open Modal
    const [comments, setComments] = useState(null);
    const [houseworkerUsername, setHouseworkerUsername] = useState('');
    const postCommentRef = useRef();
    const commentClick = useRef(false);
    const [rate, setRate] = useState('');
    // const showRateInput = useRef(false);
    const [showRateInput, setShowRateInput] = useState();
     //const [postComment, setPostComment] = useState()
    const contactMessageRef = useRef(null);



    const userAuth = useSelector((state) => state.auth)
    let client;
    if(userAuth.user)
        client = userAuth.user.type === 'Client' ? true : false;

    //USE SOCKET Custom State 

    //THIS WILL CREATE CONNECTION ON EVERY  HOOUSEWORKERCARD COMPONENT RENDER
    //const [socket, connected] = useSocket(userAuth.user)
    const socket = props.socket;

    console.log("SOCKETTT2 :" + socket);

//#region Rating
    const [rating, setRating] = useState('');
    const [professions, setProfessions] = useState([]);
    useEffect(()=>{
        fetchRating();
        fetchProfessions(); 
    },[])

    const fetchRating = async() =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/rating/${props.username}`)
        const ratingValue = result.data;
        //console.log("RATING: " + JSON.stringify(ratingValue));
        setRating(ratingValue);
    }   

    const fetchProfessions = async() =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/professions/${props.username}`)
        const professionsArray = result.data; //[{profession, rec.get(1)}]
        setProfessions(professionsArray);
    }
//#endregion Rating

// COMMENT MODAL


   //USE EFFECT will be executed ON FIRST INITIAL (We don;t need in this situation becasue)
   //we wanna fetch data only on click Comment Modal
   //To prevent this , use commentClick useRef 
    useEffect(()=>{
        if(commentClick.current == true) //if is clicked --- true
            getHouseworkerComments(houseworkerUsername)
    },[houseworkerUsername])

    const getHouseworkerComments = async(username) =>{
        const result = await axios.get(`http://localhost:5000/api/houseworker/comments/${username}`);
        const comms = result.data;
        //only if comms exist (MUST because //getHouseworkerComments will run on intialization(comms will be empty))
        //and houseowrkerUsername is initalized on start wiht ('')
        if(comms.length > 0)
            setComments(comms)

        // console.log("COMMMMESSSTT: " + JSON.stringify(comms))
        console.log("LENGTH: " + comms.length )

    }


    const onCommentHandler = (e) =>{
        if(!client){
            alert("Login to post the comment");
            return 
        }
        const username = e.target.value;
        console.log("US:" + username);
        alert(username + " Comments");
        setHouseworkerUsername(username);
        commentClick.current = true;
    }


    const postCommentHouseworker = async()=>{

    }

    //Post Comment
    const onCommentSubmit = async (e) =>{
        e.preventDefault();
        //const newComment = e.target.postComment.value; //postComment is name of input field
        const newCommentContext = postCommentRef.current.value;
        
        const houseworkerID = '4';
        
        
        //fetch out of useEffect(in this example won't be a problem)
        //this fetch will be only trigger on Comment submit this is a reason why we can fetch over the useEffect
        try{
            //obj for POST Method
            const postComment = {
                client:userAuth.user.username,
                houseworker:houseworkerUsername,
                comment: newCommentContext
            }
            const result = await axios.post(`http://localhost:5000/api/clients/comment`, postComment);
              
            //SOCKET EMIT TO Server (IN Home.js is received)
            socket.emit('comment', JSON.stringify({...postComment, houseworkerID:houseworkerID}))
            //after the server receive 'comment' signal another emit will be send to clients(Notify) 
            // socket.emit('commentResponseNotify', JSON.stringify({...postComment, id:houseworkerID}))

            console.log("RESSSS: " + JSON.stringify(result));
            const newComment = {
                //we send (looged user) comment to (showenedModal ->oldComment)
                from: userAuth.user.username,
                //comment:newCommentContext
                comment:postComment.comment
            }
            console.log(comments.length);

            //this will trigger Comp re-render
            if(comments.length > 0) //if exist comments(push new comment)
                setComments(oldComments =>[
                    // ...oldComments,
                    // newComment
                    //FIRST show NewComment
                    newComment,
                    ...oldComments
                ]);
            else
                setComments([
                    newComment
                ])
        }catch(err){
            //setError()
            console.log(err);
        }
    }

//#region CommentModalContext

    //Comment Modal Header
    const commentHeaderContext =
        'Comments';

    
    //Comment Modal context(use CommentItem)
    const commentBodyContext = 
        <form onSubmit={onCommentSubmit}>
            {comments ?
                comments.map(comm => (
                    <CommentItem
                        from={comm.from}
                        comment={comm.comment}
                    />
                ))
                : <div className='no_comments'>NoComments</div>
            }
            <input type='text' name="postComment" ref={postCommentRef} placeholder='Enter the comment'/>
            <button>Submit</button>
        </form>

    //Comments
    const commentFooterContext = 
        <div>Footer</div>



    const onCloseComment = ()=>{
        //setCommentClick(false);
        setHouseworkerUsername('');
        commentClick.current = false;
    }

//#endregion CommentModalContext

    const onRateHandler = async(e)=>{
        const username = e.target.value
        //when rate value not exist , again click on Rate button 
        //will close input
        if(rate == '')
            setShowRateInput(prev => !prev);
        else {
            try{
                const rateObj ={
                    client: userAuth.user.username,
                    houseworker: username,
                    rating:rate
                }
                const result = await axios.post('http://localhost:5000/api/clients/rate', rateObj);
                console.log("RESULTT : " + JSON.stringify(result));
            }
            catch(err){
                console.log('RateError: ' + err);
            }
            alert("YOU rated: " + username + " / With rate: " + rate);
        }

    }
    const onCloseRateHandler =()=>{
        setShowRateInput(false);
        setRate('');
    }

    const onChangeRate = (e)=>{
        setRate(e.target.value);
    }

    const onContactHandler = (e)=>{
        if(!client)
            alert("Login to establish commucation");
        else{   
        //    alert("Value: " + contactMessageRef.current.value);

           //Our ID 
           const ourID = userAuth.user.userRedisID
           //Houseworker ID

           //value prop of this button -> props.id 
        //    const houseworkerID = e.target.value;
            //Jovana is id 4 in REDIS
           const houseworkerID = '4';
           console.log("HOUSEWORKERID " + houseworkerID);
           //Room based on users ID

           const RoomID = `${ourID}:${houseworkerID}`;
           const messageObj = {
                message: contactMessageRef.current.value,
                from:ourID,
                roomID:RoomID
           }
           alert(JSON.stringify(messageObj));

           socket.emit('message', JSON.stringify(messageObj))
        }   
    }

    return (
        <>
            {/* {commentClick &&  */}
            {houseworkerUsername &&
            <Modal
                HeaderContext = {commentHeaderContext}
                BodyContext = {commentBodyContext}
                FooterContext = {commentFooterContext}
                onCloseModal={onCloseComment}
            />}
            <div className='Container-Card'>
                <h3>Licni podaci</h3>
                <div className='personal_info'>
                    <div>Username: {props.username}</div>
                    <div>First Name: {props.first_name}</div>
                    <div>Last Name: {props.last_name}</div>
                    <div>City: {props.city}</div>
                    <div>Gender: {props.gender}</div>
                    <div>Address:  {client ? props.address : <b>Login</b>}</div>
                    <div>Phone Number: {client ? '0601846529' : <b>Login</b>}</div>
                    <div>Age:{client ? '--' : <b>Login</b>} </div>
                </div>

                <br/>
                <h3>Profesije</h3>
                <div className='profession_info'>
                    {
                    professions ? 
                        professions.map(pr => 
                                <div><b>{pr.profession}</b> {pr.working_hour}din/h</div>
                            )
                    :
                    <div> No Proffessions</div>
                    }
                    
                </div>

                <br/>
                <h3>Description</h3>
                <div className='desc_info'>
                    <div>{props.description}</div>
                </div>

                <h3>Working time</h3>
                <div className='working Time'>
                    <div>{client ? 'It will be added' : <b>Login</b>}</div>
                </div>

                <br/>
                <h3>Rating</h3>
                <div className='desc_info'>
                    <div><b>{client ? parseFloat(rating).toFixed(2) : <b>Login</b>}</b></div>
                </div>

                <div className='comment-box'>
                    <button onClick={onCommentHandler} id={props.id} value={props.username}>Comment</button>
                </div>

                <div className='comment-box'>
                    {showRateInput && 
                    <>
                        <input type='number' min='1' max='5' value={rate} onChange={onChangeRate} name="rateValue" placeholder='Enter value'></input>
                        <button onClick={onCloseRateHandler}>CloseRate</button>
                    </>
                    
                    }
                    <button onClick={onRateHandler} value={props.username}>Rate</button>
                </div>

                <div className='communicate-box'>
                    <input ref={contactMessageRef}  type="text"/> 
                    <button onClick={onContactHandler} value={props.id}>Contact</button>
                    
                </div>

            </div>
        </>
    )



}


export default HouseworkersCard