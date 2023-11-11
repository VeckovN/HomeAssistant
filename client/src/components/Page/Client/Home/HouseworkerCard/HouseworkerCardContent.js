import HouseworkerCommentModal from "./HouseworkerCommentModal";
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import '../../../../../sass/components/_houseworkerCard.scss';

const HouseworkerCardContent = ({
    comments,
    onCommentSubmit, 
    postCommentRef, 
    onCommentDelete,
    onCloseComment, 
    houseworkerProps,
    isClient,
    clientUsername,
    professions,
    rating,
    showRateInput,
    rate,
    onChangeRate,
    onCloseRateHandler,
    onRateHandler,
    showRateInputCssClass,
    onCommentHandler,
    contactMessageRef,
    onContactHandler,
    commentClick
}) =>{
    console.log("TYPE OF " + typeof(parseFloat(rating)) + " VALUE: " + parseFloat(rating));
    //alert("HS CArd Context --- " + "username: "  +  houseworkerProps.username);
    return (
        <>
            {/* When is comment button Clicked */}
            {/* {houseworkerUsername &&  */}
            {commentClick.current &&
                <HouseworkerCommentModal
                    comments ={comments}
                    clientUsername={clientUsername}
                    onCommentSubmit ={onCommentSubmit}
                    postCommentRef ={postCommentRef}
                    onCommentDelete={onCommentDelete}
                    onCloseComment = {onCloseComment}
                />
            }

            <div className="houseworker-card">
                <div className={houseworkerProps.recommended ? 'houseworker-content recommended' : 'houseworker-content'}>
                    
                    <div className="img-box">
                        <img className='' src={`assets/userImages/${houseworkerProps.picturePath}`}/>
                        {/* <img src={`data:image/jpeg;base64, ${houseworkerProps.picturePath}`}></img> */}
                    </div>

                    {houseworkerProps.recommended && 
                        <label id='recommended-lb'>Preporucen</label> 
                    }

                    <div className="box-text">

                        <div className="personal-info">
                            <div className='div-text'><label className='label-category'>Personal Info</label>
                                <div className='line'> </div>  
                            </div>

                            <div className='div-text'>Username: <label className='label-text'>{houseworkerProps.username} </label>
                            </div>

                            <div className='div-text'>First name: <label className='label-text'>{houseworkerProps.first_name} </label>
                            </div>

                            <div className='div-text'>Last name: <label className='label-text'>{houseworkerProps.last_name}</label>
                            </div>

                            <div className='div-text'>City: <label className='label-text'>{houseworkerProps.city}</label>
                            </div>

                            <div className='div-text'>Gender: <label className='label-text'>{houseworkerProps.gender}</label>
                            </div>

                            <div className='div-text'>Address: <label className='label-text'> {isClient ? houseworkerProps.address : <b><a href='/login'>Log in</a></b>}</label>
                            </div>

                            <div className='div-text'>Phone number: <label className='label-text'> {isClient ? houseworkerProps.phone_number : <b><a href='/login'>Log in</a></b>}</label>
                            </div>

                            <div className='div-text'>Age: <label className='label-text'>{isClient ? houseworkerProps.age : <b><a href='/login'>Log in</a></b>}</label>
                            </div>
                        </div>

                        <div className='profession-info'>
                            <div className='div-text'><label className='label-category'>Professions</label> 
                                <div className='line'> </div>   
                            </div>
                            {
                            professions ? 
                                professions.map((pr,index) => 
                                        <div className='div-text-profession' key={index}>- <label className='label-text'>{pr.profession}</label>
                                            <div id='profession-money'> €{pr.working_hour}/hr.</div>
                                        </div>
                                    )
                            :
                            <div> No Proffessions</div>
                            }
                        </div>

                        <div className='description-info'>
                            <div className='div-text'><label className='label-text'>Description</label>
                                <div className='line'> </div>   
                            </div>
                                        
                            <div className='description-box'>
                                <div className='div-text-desc'><p>{isClient ? houseworkerProps.description : <a href='/login'>Log in</a>}</p>
                                </div>
                            </div>

                            <div className='div-text'><label className='label-text'>Rating</label>
                                <div className='line'> </div>   
                            </div>

                            <div className='rating-box'>
                                <div className='div-text-rating'>
                                    <p>{isClient ? 
                                        <Rating 
                                            name="half-rating-read" 
                                            size="small"
                                            defaultValue={parseFloat(rating)} 
                                            emptyIcon={<StarIcon style={{ color: 'grey' }} fontSize="inherit" />}
                                            precision={0.5} 
                                            readOnly /> 
                                        : <a href='/login'>Log in</a>}
                                    </p>
                                </div>
                                
                                <div className='rating-field'>
                                    {showRateInput && 
                                    <>
                                        <input type='number' min='1' max='5' value={rate} onChange={onChangeRate} name="rateValue" placeholder='Rating'></input>
                                        <button onClick={onCloseRateHandler} className='close-rate-button'>Close</button>
                                    </>
                                    
                                    }
                                    <button onClick={onRateHandler} className={showRateInputCssClass} id={houseworkerProps.id} value={houseworkerProps.username}>{showRateInput ? "Confirm" : "Rate"}</button>
                                </div>
                            </div>

                            <div className='comment-box'>
                                <button className='comment-btn' onClick={onCommentHandler} id={houseworkerProps.id} value={houseworkerProps.username}>Comment</button>
                            </div>
                        </div>

                    </div>

                    <div className='communicate-box'>
                        <input ref={contactMessageRef}  type="text" placeholder='Send a message'/> 
                        <button onClick={onContactHandler} value={houseworkerProps.id}>Contact</button>
                    </div>

                </div>

            </div>

        </>
    )
} 

export default HouseworkerCardContent;