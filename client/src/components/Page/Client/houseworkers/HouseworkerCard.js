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

import './HouseworkerCard.css'
import { toast } from 'react-toastify';

//@Todo //Custom Hook for useFetch
const HouseworkersCard = (props) =>{


    //comments of houseworker's open Modal
    const [comments, setComments] = useState(null);
    const [houseworkerUsername, setHouseworkerUsername] = useState('');
    const [houseworkerID, setHouseworkerID] = useState('');

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

    const socket = props.socket;


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
            toast.error("Uloguj se da bi komentarisao",{
                className:"toast-contact-message"
            })
            return 
        }
        const username = e.target.value;
        const id = e.target.id;

        console.log("US:" + username);
        setHouseworkerUsername(username);
        setHouseworkerID(id);

        commentClick.current = true;
    }


    const postCommentHouseworker = async()=>{

    }

    //Post Comment
    const onCommentSubmit = async (e) =>{
        e.preventDefault();
        //const newComment = e.target.postComment.value; //postComment is name of input field
        const newCommentContext = postCommentRef.current.value;

        if(newCommentContext == ''){
            toast.error("Unesite komentar");
        }
        else{
            //comment is intended for this houseworker (For comment Notify)
            // const houseworkerID = '4';
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
                
                // //SOCKET EMIT TO Server (IN Home.js is received)
                socket.emit('comment', JSON.stringify({...postComment, houseworkerID:houseworkerID}))

                //console.log("RESSSS: " + JSON.stringify(result));
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
                : <div className='no_commentsModal'>Korisnik nema komentara</div>
            }
            <div className='comment_input'>
                <input type='text' name="postComment" ref={postCommentRef} placeholder='Unesite komentar'/>
                <button type="submit">Posalji</button>
            </div>
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

        if(!client){
            toast.error("Uloguj se da bi ostavio ocenu",{
                className:"toast-contact-message"
            })
            return 
        }
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
            
            alert("YOU rated: " + username + " / With rate: " + rate + "YYPE :" + typeof(rate));
        }
    }

    const onCloseRateHandler =()=>{
        setShowRateInput(false);
        setRate('');
    }

    const onChangeRate = (e)=>{
        setRate(parseInt(e.target.value));
    }

    const onContactHandler = (e)=>{
        if(!client)
            toast.error("Uloguj se da bi poslao poruku",{
                className:"toast-contact-message"
            })
        else{   
        //    alert("Value: " + contactMessageRef.current.value);
            const messageFromContact = contactMessageRef.current.value

            if(messageFromContact!='')
            {
                const ourID = userAuth.user.userRedisID
                //value prop of this button -> props.id 
                const houseworkerID = e.target.value;

                console.log("HOUSEWORKERID " + houseworkerID);
                //Room based on users ID
                const RoomID = `${ourID}:${houseworkerID}`;
                const messageObj = {
                        message: messageFromContact,
                        from:ourID,
                        roomID:RoomID
                }
                alert(JSON.stringify(messageObj));
                socket.emit('message', JSON.stringify(messageObj))
                toast.success("Poruka je poslata",{
                    className:'toast-contact-message'
                })
                contactMessageRef.current.value='';

            }
            else
                toast.error("Ne mozes poslati praznu poruku",{
                    className:"toast-contact-message"
                })
        
        }   
    }

    //showRateInputCssClass
    var showRateInputCssClass =''
    if(!showRateInput)
        showRateInputCssClass ='open-rate-button'
    else
        showRateInputCssClass ='accept-rate-button'

    var recommendedCssClass = 'houseworker-content '
    props.recommended ? recommendedCssClass += ' recommended' : ''


    
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
            <div className="houseworker-card">
                <div className={recommendedCssClass}>
                    
                    <div className="imgBox">
                        {/* <img clasName="image">IMG FROM DB</img> */}
                        {/* <img src={profilePicture}></img> */}
                        <img className='' src={`assets/userImages/${props.picturePath}`}/>
                        {/* <p1>{props.picturePath}</p1> */}
                        {/* <img src={`data:image/jpeg;base64, ${props.picturePath}`}></img> */}
                    </div>

                    {props.recommended && 
                        <div className='recommendedText'>Preporucen</div> 
                    }

                    <div className="textBox">

                        <div className="personal-info">
                            <div className='div-text'><label className='label-category'>Licni Podaci</label>
                                <div className='line'> </div>  
                            </div>

                            <div className='div-text'>Korisnicko ime: <label className='label-text'>{props.username} </label>
                            </div>

                            <div className='div-text'>Ime: <label className='label-text'>{props.first_name} </label>
                            </div>

                            <div className='div-text'>Prezime: <label className='label-text'>{props.last_name}</label>
                            </div>

                            <div className='div-text'>Grad: <label className='label-text'>{props.city}</label>
                            </div>

                            <div className='div-text'>Pol: <label className='label-text'>{props.gender}</label>
                            </div>

                            <div className='div-text'>Adresa: <label className='label-text'> {client ? props.address : <b>Uloguj se</b>}</label>
                            </div>

                            <div className='div-text'>Broj Telefona: <label className='label-text'> {client ? props.phone_number : <b>Uloguj se</b>}</label>
                            </div>

                            <div className='div-text'>Godine: <label className='label-text'>{client ? props.age : <b>Login</b>}</label>
                            </div>
                        </div>

                        <div className='profession-info'>
                            <div className='div-text'><label className='label-category'>Profesije</label> 
                                <div className='line'> </div>   
                            </div>
                            {
                            professions ? 
                                professions.map(pr => 
                                        <div className='div-text-profession'>- <label className='label-text'>{pr.profession} </label>
                                            <div className='profession-money'> {pr.working_hour}din </div>
                                        </div>
                                    )
                            :
                            <div> No Proffessions</div>
                            }
                        </div>

                        <div className='description-info'>
                            <div className='div-text'><label className='label-text'>Opis</label>
                                <div className='line'> </div>   
                            </div>
                                        
                            <div className='description-box'>
                                <div className='div-text-desc'><p1>{client ? props.description :<b>Login</b>}</p1>
                                </div>
                            </div>

                            <div className='div-text'><label className='label-text'>Ocena</label>
                                <div className='line'> </div>   
                            </div>

                            <div className='rating-box'>
                                <div className='div-text-rating'><p1>{client ? parseFloat(rating).toFixed(1) : <b>Login</b>}</p1>
                                </div>
                                <div className='rating-field'>
                                    {showRateInput && 
                                    <>
                                        <input type='number' min='1' max='5' value={rate} onChange={onChangeRate} name="rateValue" placeholder='Ocena'></input>
                                        <button onClick={onCloseRateHandler} className='close-rate-button'>Zatvori</button>
                                    </>
                                    
                                    }
                                    <button onClick={onRateHandler} className={showRateInputCssClass} value={props.username}>{showRateInput ? "Potvrdi" : "Oceni"}</button>
                                </div>
                            </div>

                            <div className='comment-box'>
                                <button className='comment-btn' onClick={onCommentHandler} id={props.id} value={props.username}>Comment</button>
                            </div>

                        </div>

                    </div>

                    <div className='communicate-box'>
                        <input ref={contactMessageRef}  type="text" placeholder='Unesite poruku'/> 
                        <button onClick={onContactHandler} value={props.id}>Contact</button>
                    </div>

                </div>

            </div>



{/* 
            <div className='Container-Card'>
                <h3>Licni podaci</h3>
                <div className='personal_info'>
                    <div>Username: {props.username}</div>
                    <div>First Name: {props.first_name}</div>
                    <div>Last Name: {props.last_name}</div>
                    <div>City: {props.city}</div>
                    <div>Gender: {props.gender}</div>
                    <div>Address:  {client ? props.address : <b>Login</b>}</div>
                    <div>Phone Number: {client ? props.phone_number : <b>Login</b>}</div>
                    <div>Age:{client ? props.age : <b>Login</b>} </div>
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
                    <div>{client ? props.description :<b>Login</b> }</div>
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

            </div> */}
        </>
    )



}


export default HouseworkersCard