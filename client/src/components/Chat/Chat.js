import {useRef, useState, useEffect} from 'react';
import useTyping from '../../hooks/useTyping';
import TypingUsers from './TypingUsers';
import ChatMenu from './ChatMenu'; 
import ChatMessages from './ChatMessages';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';

import '../../sass/components/_chat.scss';
import Spinner from '../UI/Spinner';

const Chat = ({
    socket,
    roomMessages, 
    rooms, 
    roomInfo, 
    user, 
    showMenu, 
    showChatView,
    houseworkers, 
    isLoadingMessages,
    typingUsers,
    pageNumberRef, 
    onShowRoomsButtonHandler,
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
    }

    const stopTypingMessageEmit = () =>{
        if(!socket) return;
        socket.emit("stopTypingRoom", {roomID:roomInfo.roomID, user})
        stopTypingOnSendMessage();
    }

    const {startTypingHandler, stopTypingOnSendMessage} = useTyping(startTypingMessageSendEmit, stopTypingMessageEmit);

    const listenOnUserTyping = () =>{
        //listen only for one interval -> Don't reapeat on Interval re-rendering
        socket.on("typingMessageStart", (sender) =>{
            const {senderID, senderUsername} = sender;

            if(senderID == user.userID)
                return;
            
            const data = {userID:senderID, username:senderUsername}
            onAddTypingUserHandler(data); 
        })
    }   

    const listenOnUserStopTyping = () =>{
        socket.on("typingMessageStop", (sender) =>{
            const {senderID, senderUsername} = sender;

            if(senderID == user.userID)
                return;
            
            const data = {userID:senderID, username:senderUsername}
            onRemoveTypingUserHandler(data);
        })
    }

    //use UseEffect to listen only once (to avoid to this listen set on component re-rednering)
    useEffect(() =>{
        listenOnUserTyping();
        listenOnUserStopTyping();

        return () =>{
            socket.off("typingMessageStart", listenOnUserTyping)
            socket.off("typingMessageStop", listenOnUserStopTyping)
        }
    },[])

    
    const onSendHandler = () =>{
        const message = messageInputRef.current.value;
        const fromRoomID = roomInfo.roomID;
        if(message != '')
            messageInputRef.current.value = ''

        onSendMessageHandler({message, fromRoomID});
        lastMessageRef.current?.scrollIntoView({behavior: 'instant', block: 'nearest'});
        stopTypingMessageEmit();
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
                {showChatView && 
                <section className='rooms-container-chat-view'>
                    <div className='chat-view-button-container'>
                        <button onClick={onShowRoomsButtonHandler}>Rooms</button>
                    </div>
                </section>
                }         
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
                <TypingUsers typingUsers={typingUsers}/>
                {isLoadingMessages ?
                    <div className='message-chat-spinner'>
                        <Spinner/>
                    </div>
                    :
                    <>
                    {roomMessages?.length >0 ?   
                    (
                        //prevent to re-render only when the props are changed(memo used in RoomMessages)
                        //(not on typingUser changes)
                        <ChatMessages
                            roomMessages={roomMessages}
                            user={user}
                            roomInfo={roomInfo}
                            lastMessageRef={lastMessageRef}
                            observerTarget={observerTarget}
                        />
                    )
                    :
                    <div className='no_conversation'>
                        You have no conversation. Contact a houseworker!
                    </div>
                    }
                    </>
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