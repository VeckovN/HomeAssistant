import {useRef, useState, useCallback, memo} from 'react';
import { emitMessage } from '../../../../sockets/socketEmit';
import { toast } from 'react-toastify';
import ChatMenu from './ChatMenu';

import '../../../../sass/components/_chat.scss';

const Chat = ({socket, roomMessages, rooms, roomInfo, user, showMenu, houseworkers, onAddUserToGroupHanlder, onDeleteRoomHandler, onShowMenuToggleHandler }) =>{
    const messageRef = useRef(); //taken message from input

    const onSendMessageHandler = () =>{
        const message = messageRef.current.value;
        const fromRoomID = roomInfo.roomID;

        if(message != ''){
            messageRef.current.value = ''
            //emit io.socket event for sending mesasge
            //this will trigger evento on server (in index.js) and send message to room
            const messageObj = {
                message:message,
                //who send message()
                from:user.userID,
                roomID:fromRoomID,
                fromUsername:user.username
            }
            //emit message(server listen this for sending message to user(persist in db) )
            //and also client listen this event to notify another user for receiving message
            emitMessage(socket, {messageObj});

            //SOUND NOTIFICATION WHEN ON MESSAGE SENDING
        }
        else
            toast.error("Empty message cannot be sent",{
                className:'toast-contact-message'
            })
    }

    return(     
        <>
            <div className="header-chat">                  
                <p className="names">
                    {roomInfo?.users?.map((room) =>(
                        <div className='user'>
                            <i className="fa fa-user-o" aria-hidden="true"><span>{room}</span></i>
                        </div>
                    ))}
                </p>
                {user.type=="Client" && <i className="icon right fa fa-ellipsis-h" onClick={onShowMenuToggleHandler} aria-hidden="true"></i>}
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
            
            {/* <div className='messages-chat'> */}
            <div className={`messages-chat ${showMenu && 'showMenu'}`}>
            {roomMessages?.length >0 &&    
            <>
                {roomMessages.map(el =>{
                    if(user.userID==el.from){
                        //messageContext=' my-message'
                        //My message -
                        return(
                        <div className="message text-only">
                            <div className="response">
                                <p className="text"> {el.message}</p>
                            </div>
                        </div>
                        )
                        // if there is more continious message of the same user then print next message
                        //or print time of last message
                    }
                    else{
                        // messageContext=' notMy-message'
                        //set picture with message context
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
            </>
            }
            </div>
            <div className="footer-chat" >
                {/* <i className="icon fa fa-smile-o clickable" style={{fontSize:"25pt"}} aria-hidden="true"></i> */}
                {/* <input type="text" className="write-message" placeholder="Type your message here"></input> */}
                <input
                    type='text'
                    className={`write-message ${showMenu && 'showMenu'} `}
                    placeholder="Type your message here"
                    name='message-text'
                    ref={messageRef}
                    disabled={showMenu}
                />
                <button className={`icon send fa fa-paper-plane-o clickable ${showMenu && 'showMenu'}` } onClick={onSendMessageHandler} disabled={showMenu} ></button>
            </div>
            
        </>
    )
}

export default Chat;