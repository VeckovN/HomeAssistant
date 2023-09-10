import HouseworkerCommentModal from "./HouseworkerCommentModal";

const HouseworkerCardContent = ({
    houseworkerUsername,
    comments,
    onCommentSubmit, 
    postCommentRef, 
    onCommentDelete,
    onCloseComment, 
    HouseworkerProps,
    isClient,
    client_username,
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
    return (
        <>
            {/* When is comment button Clicked */}
            {/* {houseworkerUsername &&  */}
            {commentClick.current &&
                <HouseworkerCommentModal
                    comments ={comments}
                    client_username={client_username}
                    onCommentSubmit ={onCommentSubmit}
                    postCommentRef ={postCommentRef}
                    onCommentDelete={onCommentDelete}
                    onCloseComment = {onCloseComment}
                />
            }

            <div className="houseworker-card">
                <div className={HouseworkerProps.recommended ? 'houseworker-content recommended' : 'houseworker-content'}>
                    
                    <div className="imgBox">
                        {/* <img clasName="image">IMG FROM DB</img> */}
                        {/* <img src={profilePicture}></img> */}
                        <img className='' src={`assets/userImages/${HouseworkerProps.picturePath}`}/>
                        {/* <p>{HouseworkerProps.picturePath}</p> */}
                        {/* <img src={`data:image/jpeg;base64, ${HouseworkerProps.picturePath}`}></img> */}
                    </div>

                    {HouseworkerProps.recommended && 
                        <div className='recommendedText'>Preporucen</div> 
                    }

                    <div className="textBox">

                        <div className="personal-info">
                            <div className='div-text'><label className='label-category'>Personal Info</label>
                                <div className='line'> </div>  
                            </div>

                            <div className='div-text'>Username: <label className='label-text'>{HouseworkerProps.username} </label>
                            </div>

                            <div className='div-text'>First name: <label className='label-text'>{HouseworkerProps.first_name} </label>
                            </div>

                            <div className='div-text'>Last name: <label className='label-text'>{HouseworkerProps.last_name}</label>
                            </div>

                            <div className='div-text'>City: <label className='label-text'>{HouseworkerProps.city}</label>
                            </div>

                            <div className='div-text'>Gender: <label className='label-text'>{HouseworkerProps.gender}</label>
                            </div>

                            <div className='div-text'>Address: <label className='label-text'> {isClient ? HouseworkerProps.address : <b><a href='/login'>Log in</a></b>}</label>
                            </div>

                            <div className='div-text'>Phone number: <label className='label-text'> {isClient ? HouseworkerProps.phone_number : <b><a href='/login'>Log in</a></b>}</label>
                            </div>

                            <div className='div-text'>Age: <label className='label-text'>{isClient ? HouseworkerProps.age : <b><a href='/login'>Log in</a></b>}</label>
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
                                            <div className='profession-money'> {pr.working_hour}din </div>
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
                                <div className='div-text-desc'><p>{isClient ? HouseworkerProps.description : <b>Log in</b>}</p>
                                </div>
                            </div>

                            <div className='div-text'><label className='label-text'>Rating</label>
                                <div className='line'> </div>   
                            </div>

                            <div className='rating-box'>
                                <div className='div-text-rating'><p>{isClient ? parseFloat(rating).toFixed(1) : <b>Login</b>}</p>
                                </div>
                                <div className='rating-field'>
                                    {showRateInput && 
                                    <>
                                        <input type='number' min='1' max='5' value={rate} onChange={onChangeRate} name="rateValue" placeholder='Rating'></input>
                                        <button onClick={onCloseRateHandler} className='close-rate-button'>Close</button>
                                    </>
                                    
                                    }
                                    <button onClick={onRateHandler} className={showRateInputCssClass} value={HouseworkerProps.username}>{showRateInput ? "Confirm" : "Rate"}</button>
                                </div>
                            </div>

                            <div className='comment-box'>
                                <button className='comment-btn' onClick={onCommentHandler} id={HouseworkerProps.id} value={HouseworkerProps.username}>Comment</button>
                            </div>

                        </div>

                    </div>

                    <div className='communicate-box'>
                        <input ref={contactMessageRef}  type="text" placeholder='Send a message'/> 
                        <button onClick={onContactHandler} value={HouseworkerProps.id}>Contact</button>
                    </div>

                </div>

            </div>

        </>
    )
} 

export default HouseworkerCardContent;