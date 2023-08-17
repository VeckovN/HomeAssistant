import {useRef, useCallback} from 'react';
import { toast } from 'react-toastify';

import './Chat.css'


const Chat = ({socket, roomMessages, roomRef, user}) =>{

    console.log("CHAAAAAAAAAAAAATTTTTTTTTTTTTT");

    const messageRef = useRef(); //taken message from input

    // const onSendMessageHandler = () =>{
    const onSendMessageHandler = useCallback(() =>{
        const message = messageRef.current.value;
        const fromRoomID = roomRef.current.value;

        if(message != ''){
            //In REDUX set redisID userID(for each username)
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
            socket.emit('message', JSON.stringify(messageObj));
            //io.emit or somethingn ('message', messageObj)
            toast.success("Poruka je poslata",{
                className:'toast-contact-message'
            })
        }
        else
            toast.error("Ne mozes poslati praznu poruku",{
                className:'toast-contact-message'
            })
    },[roomRef, user,socket])

    let messageContext;

    return(
        // <div className="chat_container">            
        <div className='messages_container'>
            {roomMessages.length >0 &&
                <>
                    <div className='messages_box'>
                    {roomMessages.map(el =>{
                        if(user.userID==el.from){
                            messageContext=' my_message'
                        }
                        else{
                            messageContext=' notMy_message'
                        }

                        return <>
                                <div className='message'>
                                    <div className={`context ${messageContext}`}><span> <span className='user_name'>{user.userID==el.from ? 'Ja' : el.fromUsername}</span> : {el.message}</span> </div>
                                </div>
                            </>
                    })}
                    <div className='sendMessageBox'>
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