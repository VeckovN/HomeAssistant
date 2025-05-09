import { Link } from "react-router-dom";
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import HouseworkerCommentModal from './HouseworkerCommentModal';

import '../../sass/components/_houseworkerCard.scss';

const HouseworkerCardContent = ({
    socket,
    houseworkerProps,
    isClient,
    clientUsername,
    houseworkerRating,
    houseworkerProfessions,
    showRateInput,
    rate,
    onChangeRate,
    onCloseRateHandler,
    onRateHandler,
    showRateInputCssClass,
    clickedHouseworker,
    onCommentHandler,
    contactMessageRef,
    onContactHandler,
    onCloseComment,
    commentClick,
}) =>{
    const loadDefaultImageOnError = e =>{
        e.target.onerror = null;
        e.target.src = `assets/userImages/userDefault.png`;
    }
    const ratingValue = houseworkerRating !=null ? houseworkerRating : 0;

    return (
        <>
            {commentClick.current &&
            //when the comments is not null show the modal
                <HouseworkerCommentModal
                    socket={socket}
                    isClient={isClient}
                    clientUsername={clientUsername}
                    houseworker={clickedHouseworker}
                    commentClick={commentClick}
                    onCloseComment={onCloseComment}
                />
            }

            <div className="houseworker-card">
                <div className={houseworkerProps.recommended ? 'houseworker-content recommended' : 'houseworker-content'}>
                    
                    <div className="img-box">
                        <img
                            src={`${houseworkerProps.picturePath}`}
                            // src={`assets/userImages/${houseworkerProps.picturePath}`}
                            onError={loadDefaultImageOnError}
                            loading="lazy"
                            alt="avatar"
                        />
                    </div>

                    {houseworkerProps.recommended && 
                        <label id='recommended-lb'>Recommended</label> 
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

                            <div className='div-text'>Address: <label className='label-text'> {isClient ? houseworkerProps.address : <b><Link to='/login' className='link'>Log in</Link></b>}</label>
                            </div>

                            <div className='div-text'>Phone number: <label className='label-text'> {isClient ? houseworkerProps.phone_number : <b><Link to='/login' className='link'>Log in</Link></b>}</label>
                            </div>

                            <div className='div-text'>Age: <label className='label-text'>{isClient ? houseworkerProps.age : <b><Link to='/login' className='link'>Log in</Link></b>}</label>
                            </div>
                        </div>

                        <div className='profession-info'>
                            <div className='div-text'><label className='label-category'>Professions</label> 
                                <div className='line'> </div>   
                            </div>
                            {
                            houseworkerProfessions ? 
                                houseworkerProfessions.map((pr,index) => 
                                        <div className='div-text-profession' key={index}><label className='label-text profession-text'>{pr.profession}</label>
                                            <div id='profession-money'> €{pr.working_hour}/hr</div>
                                        </div>
                                    )
                            :
                            <div> No Proffessions</div>
                            }
                        </div>

                        <div className='description-info'>
                            <div className='div-text'><label className='label-category'>Description</label>
                                <div className='line'> </div>   
                            </div>
                                        
                            <div className='description-box'>
                                <div className='div-text-desc'><p>{isClient ? houseworkerProps.description : <Link to='/login' className='link'>Log in</Link>}</p>
                                </div>
                            </div>

                            <div className='div-text'><label className='label-category'>Rating</label>
                                <div className='line'> </div>   
                            </div>

                            <div className='rating-box'>
                                <div className='div-text-rating'>
                                    <div>{isClient ? 
                                        //NOT OPTIMIZED FOR REDERING MORE COMPONENTS
                                        <Rating 
                                            name="half-rating-read" 
                                            size="small"
                                            defaultValue={ratingValue} 
                                            value={ratingValue}
                                            emptyIcon={<StarIcon style={{ color: 'grey' }} fontSize="inherit" />}
                                            precision={0.5} 
                                            readOnly 
                                        />
                                        : <Link to='/login' className='link'>Log in</Link>}
                                    </div>
                                </div>
                                
                                <div className='rating-field'>
                                    {showRateInput && 
                                    <>
                                        <input type='number' min='1' max='5' value={rate} onChange={onChangeRate} name="rateValue" placeholder='Rating'></input>
                                        <button onClick={onCloseRateHandler} className='close-rate-button'>Close</button>
                                    </>
                                    
                                    }
                                    <button onClick={onRateHandler} className={showRateInputCssClass} value={houseworkerProps.username} id={houseworkerProps.id}>{showRateInput ? "Confirm" : "Rate"}</button>
                                </div>
                            </div>

                            <div className='div-text'><label className='label-category'>Commnets</label>
                                <div className='line'> </div>   
                            </div>

                            <div className='comment-box'>
                                <button className='comment-btn' onClick={onCommentHandler}  value={houseworkerProps.username} id={houseworkerProps.id}>Comment</button>
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