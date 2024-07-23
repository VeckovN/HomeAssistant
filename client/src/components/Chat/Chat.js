import {useRef, useState, useEffect} from 'react';
import useTyping from '../../hooks/useTyping';
import ChatMenu from './ChatMenu'; 
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';

import '../../sass/components/_chat.scss';

const Chat = ({
    socket,
    roomMessages, 
    rooms, 
    roomInfo, 
    user, 
    showMenu, 
    houseworkers, 
    typingUsers,
    pageNumberRef, 
    fetchMoreMessages,
    onSendMessageHandler, 
    onAddUserToGroupHanlder,
    onKickUserFromGroupHandler, 
    onDeleteRoomHandler, 
    onShowMenuToggleHandler,
    onAddTypingUserHandler,
    onRemoveTypingUserHandler
 }) =>{
    const messageInputRef = useRef();
    const lastMessageRef = useRef(null);
    const observerTarget = useRef(null);
    const conversation = roomMessages?.length >0;

    const startTypingMessageSendEmit = () =>{
        if(!socket) return;

        socket.emit("startTypingRoom", {roomID:roomInfo.roomID, user})
        console.log(`socket.emit("Start_Typing_Event_room", {roomID:roomInfo.roomID, user})`)
    }

    const stopTypingMessageEmit = () =>{
        if(!socket) return;
            socket.emit("stopTypingRoom", {roomID:roomInfo.roomID, user})
        console.log(` socketRef.current.emit("Stop_Typing_Event_room", {roomID:roomInfo.roomID})`)
        stopTypingOnSendMessage();
    }

    const {startTypingHandler, stopTypingOnSendMessage} = useTyping(startTypingMessageSendEmit, stopTypingMessageEmit);

    const listenOnUserTyping = () =>{
        //listen only for one interval -> Don't reapeat on Interval re-rendering
            socket.on("typingMessageStart", (sender) =>{
                const {senderID, senderUsername} = sender;
    
                console.log("LISTENN BEFORE : ")
                if(senderID == user.userID){
                    //dont add it to arraty
                    console.log("MEE : ", user.userID);
                    return;
                }
                else{
                    console.log("LISTENN : " , sender)
                    //that trigger re-rendering
                    //SET TYPING USER IN MESSAGE CONTEXT -> and display Typing users animation
                    
                    const data = {
                        userID:senderID, 
                        username:senderUsername
                    }
                    onAddTypingUserHandler(data);                    
                }
        
              })
    }   

    const listenOnUserStopTyping = () =>{
        socket.on("typingMessageStop", (sender) =>{
            const {senderID, senderUsername} = sender;

            console.log("LISTENN STOP BEFORE : ")
            if(senderID == user.userID){
                //dont add it to arraty
                console.log("MEE : ", user.userID);
                return;
            }
            else{
                console.log("LISTENN STOP : " , sender)
                const data = {
                    userID:senderID, 
                    username:senderUsername
                }
                onRemoveTypingUserHandler(data);
            }
    
          })
    }

    //use UseEffect to listen only once (to avoid to this listen set on component re-rednering)
    useEffect(() =>{
        console.log("USE EFFECT TOOO");
        listenOnUserTyping();
        listenOnUserStopTyping();

        return () =>{
            // socket.off("typingMessageStart")
            console.log("SOCKET OFF");
        }
    },[])

    
    const onSendHandler = () =>{
        const message = messageInputRef.current.value;
        const fromRoomID = roomInfo.roomID;
        if(message != '')
            messageInputRef.current.value = ''

        onSendMessageHandler({message, fromRoomID});
        lastMessageRef.current?.scrollIntoView({behavior: 'instant', block: 'nearest'});
        stopTypingOnSendMessage();
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
            {/* don't show typing users when the user typiong in chat */}
            {typingUsers && 
                <div className='typing-users'>
                    {typingUsers.map((el,index) => (
                        <div className='user-t' key={el.userID + index}>
                            ...{el.username}
                        </div>
                    ))}
                </div>
            }
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
                    placeholder={`Type your message here`}
                    name='message-text'
                    ref={messageInputRef}
                    onKeyDown={startTypingHandler}
                    disabled={showMenu || !conversation}
                />
                <button className={`send-icon ${showMenu && 'showMenu'}` } onClick={onSendHandler} disabled={showMenu || !conversation}><SendIcon/></button>
            </div>
            
        </>
    )
}

export default Chat;