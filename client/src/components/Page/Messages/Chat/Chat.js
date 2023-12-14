import {useRef, useEffect, useState, useCallback, memo} from 'react';
import ChatMenu from './ChatMenu';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';

import '../../../../sass/components/_chat.scss';

const Chat = ({roomMessages, rooms, roomInfo, user, showMenu, houseworkers, onSendMessageHandler, onAddUserToGroupHanlder, onDeleteRoomHandler, onShowMenuToggleHandler }) =>{
    const messageRef = useRef(); //taken message from input
    
    const onSendHandler = () =>{
        const message = messageRef.current.value;
        const fromRoomID = roomInfo.roomID;
        if(message != '')
            messageRef.current.value = ''

        onSendMessageHandler({message, fromRoomID});
    }
    //Scroll to bottom of chat
    const endMessageRef = useRef(null);
    const scrollToBottom = () =>{
        endMessageRef.current?.scrollIntoView({ behavior: "instant" });
    }
    useEffect(() =>{
        scrollToBottom();
    },[roomMessages]);

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
                {user.type=="Client" && <div className='menu-icon' onClick={onShowMenuToggleHandler} aria-hidden="true"><MenuIcon/></div>}
                
            </div>

            {showMenu && 
                <div className='chat-menu'>
                    <ChatMenu 
                        houseworkers={houseworkers}
                        rooms={rooms}
                        roomInfo={roomInfo}
                        onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                        onDeleteRoomHandler={onDeleteRoomHandler}
                    /> 
                </div>
            }
            
            <div className={`messages-chat ${showMenu && 'showMenu'}`}>
            {roomMessages?.length >0 &&    
            <>
                {roomMessages.map(el =>{
                    if(user.userID==el.from){
                        return(
                        <div className="message text-only">
                            <div className="response">
                                <p className="text"> {el.message}</p>
                            </div>
                        </div>
                        )
                    }
                    else{
                        return(
                        <div className="message">
                            <div className="photo" style={{backgroundImage: "url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80)"}}>
                            {/* ADD PICTURE PATH IN USER OBJ */}
                            {/* <div className="photo" src={`assets/userImages/${user.picturePath}`}> */}
                                <div className="online"></div>
                            </div>
                            <p className="text"> {el.message}</p>
                        </div>
                        // if is it last message in row of user then show timer
                        // <p className="time"> 14h58</p>
                        )
                    }
                })}
                <div className='endMessagerefDiv' ref={endMessageRef}></div>
            </>
            }
            </div>
            <div className="footer-chat" >
                <input
                    type='text'
                    className={`write-message ${showMenu && 'showMenu'} `}
                    placeholder="Type your message here"
                    name='message-text'
                    ref={messageRef}
                    disabled={showMenu}
                />
                <button className={`send-icon ${showMenu && 'showMenu'}` } onClick={onSendHandler} disabled={showMenu}><SendIcon/></button>
            </div>
            
        </>
    )
}

export default Chat;