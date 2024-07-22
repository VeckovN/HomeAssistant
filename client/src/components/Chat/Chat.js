import {useRef, useState, useEffect, useCallback} from 'react';
import ChatMenu from './ChatMenu'; 
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';

import '../../sass/components/_chat.scss';

const Chat = ({
    roomMessages, 
    rooms, 
    roomInfo, 
    user, 
    showMenu, 
    houseworkers, 
    pageNumberRef, 
    fetchMoreMessages,
    onSendMessageHandler, 
    onAddUserToGroupHanlder,
    onKickUserFromGroupHandler, 
    onDeleteRoomHandler, 
    onShowMenuToggleHandler
 }) =>{
    const messageInputRef = useRef();
    const lastMessageRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const observerTarget = useRef(null);

    const conversation = roomMessages?.length >0;
    
    const onSendHandler = () =>{
        const message = messageInputRef.current.value;
        const fromRoomID = roomInfo.roomID;
        if(message != '')
            messageInputRef.current.value = ''

        onSendMessageHandler({message, fromRoomID});
        lastMessageRef.current?.scrollIntoView({behavior: 'instant', block: 'nearest'});
    }

    const options = {
        threshold: 0.1,
      };

    useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0] && entries[0].isIntersecting) {
                const newPage = pageNumberRef.current + 1; 
                pageNumberRef.current = newPage;
                fetchMoreMessages(roomInfo.roomID, newPage);
                // setTimeout(() => {
                //     const newPage = pageNumberRef.current + 1;
                //     pageNumberRef.current = newPage;
                //     fetchMoreMessages(roomInfo.roomID, newPage);
                //     setLoading(false);
                // }, 200); // Wait for 0.5 seconds
            }
          }, options)
      
        if (observerTarget.current) {
          observer.observe(observerTarget.current)
        }
    
        return () => {
          if (observerTarget.current) {
            observer.unobserve(observerTarget.current)
          }
        }
      }, [observerTarget.current, roomInfo]);
    //   }, [observerTarget.current]);


    return(     
        <>
            <div className="header-chat">                  
                <div className="names">
                    {roomInfo?.users?.map((room) =>(
                        <div className='user'>
                            <PersonIcon fontSize='small'/><span>{room.username}</span>
                        </div>
                    ))}
                </div>
                {user.type=="Client" && roomInfo.roomID!=null && <div className='menu-icon' onClick={onShowMenuToggleHandler} aria-hidden="true"><MenuIcon/></div>}
                
            </div>

            {showMenu &&
                <>
                <div className='chat-menu'>
                    <ChatMenu 
                        houseworkers={houseworkers}
                        rooms={rooms}
                        roomInfo={roomInfo}
                        onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                        onKickUserFromGroupHandler={onKickUserFromGroupHandler}
                        onDeleteRoomHandler={onDeleteRoomHandler}
                    /> 
                </div>
                </>
            }
            
            {/* infinity message load */}
            <div className={`messages-chat ${showMenu && 'showMenu'}`}>
            {roomMessages?.length >0 ?   
            <>
                {roomMessages.map((el,index) =>{
                    if(user.userID==el.from || el.from === "Server"){
                        return(
                        <div 
                            // key={`r-${el.roomID}`}
                            className={`${el.from === "Server" ? "server" : "message text-only"} ${index == 0 && 'scroll-el'}`}
                            ref={index === 0 ? lastMessageRef : null}
                        >
                            <div className="response">
                                {el.date && el.from !== "Server" && <p className='date-response'>{`${el.date.day}.${el.date.month}.${el.date.year} ${el.date.time}`}</p>}
                                <p className="text"> {el.message}</p>
                            </div>
                        </div>
                        )
                    }
                    else{
                        let userPicturePath;
                        roomInfo.users.forEach(element => {
                            if(element.username === el.fromUsername){
                                userPicturePath = element.picturePath;
                            }
                        });

                        return(
                        <div className="message">
                            <div className="photo" style={{ backgroundImage: `url(assets/userImages/${userPicturePath})` }}>
                                <div className='photo-hover-username'>{el.fromUsername}</div>
                                <div className="online"></div>
                            </div>
                            <p className="text"> {el.message}</p>
                            {el.date && <p className='date'>{`${el.date.day}.${el.date.month}.${el.date.year} ${el.date.time}`}</p>}
                        </div>
                        // if is it last message in row of user then show timer
                        // <p className="time"> 14h58</p>
                        )
                    }
                })}
                <div ref={observerTarget}></div>
                {/* {loading === true && <p>Loading ... </p>} */}
            </>
            :
            <div className='no_conversation'>
                You have no conversation. Contact a houseworker!
            </div>
            
            }
            </div>

            <div className="footer-chat" >
                <input
                    type='text'
                    className={`write-message ${showMenu && 'showMenu'} `}
                    placeholder="Type your message here"
                    name='message-text'
                    ref={messageInputRef}
                    disabled={showMenu || !conversation}
                />
                <button className={`send-icon ${showMenu && 'showMenu'}` } onClick={onSendHandler} disabled={showMenu || !conversation}><SendIcon/></button>
            </div>
            
        </>
    )
}

export default Chat;