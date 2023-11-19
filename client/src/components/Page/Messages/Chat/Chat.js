import {useRef} from 'react';
import { emitMessage } from '../../../../sockets/socketEmit';
import { toast } from 'react-toastify';

import '../../../../sass/components/_chat.scss';

const Chat = ({socket, roomMessages, roomRef, user}) =>{
    const messageRef = useRef(); //taken message from input

    const onSendMessageHandler = () =>{
        const message = messageRef.current.value;
        const fromRoomID = roomRef.current.value;

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

    let messageContext;
    return(     
        <>
            <div className="header-chat">
                <i className="icon fa fa-user-o" aria-hidden="true"></i>
                <p className="name">{user.username}</p>
                <i className="icon right clickable fa fa-ellipsis-h" aria-hidden="true"></i>
            </div>
            
            <div className='messages-chat'>
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
            <div className="footer-chat">
                {/* <i className="icon fa fa-smile-o clickable" style={{fontSize:"25pt"}} aria-hidden="true"></i> */}
                {/* <input type="text" className="write-message" placeholder="Type your message here"></input> */}
                <input
                    type='text'
                    className="write-message"
                    placeholder="Type your message here"
                    name='message-text'
                    ref={messageRef}
                />
                <i className="icon send fa fa-paper-plane-o clickable" onClick={onSendMessageHandler} aria-hidden="true"></i>
            </div>
            
        </>
    )
}

export default Chat;