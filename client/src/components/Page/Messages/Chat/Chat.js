import {useRef} from 'react';
import { emitMessage } from '../../../../sockets/socketEmit';
import { toast } from 'react-toastify';

//import './Chat.css'
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
        // <div className="chat_container">            
        <div className='messages-container'>
            {roomMessages.length >0 &&
                <>
                    <div className='messages-box'>
                    {roomMessages.map(el =>{
                        if(user.userID==el.from){
                            messageContext=' my-message'
                        }
                        else{
                            messageContext=' notMy-message'
                        }

                        return <>
                                <div className='message'>
                                    <div className={`context ${messageContext}`}><span> <span className='user_name'>{user.userID==el.from ? 'Ja' : el.fromUsername}</span> : {el.message}</span> </div>
                                </div>
                            </>
                    })}
                    <div className='messages-box-send'>
                        <input
                            type='text'
                            name='message-text'
                            placeholder="Unesite poruku"
                            ref={messageRef}
                        />
                        
                        <button onClick={onSendMessageHandler}>Send</button>
                    </div>
            </div>  
                </>          
            }
            
        </div>
    )
}

export default Chat;