import {useRef} from 'react';
import { emitMessage } from '../../sockets/socketEmit';
import { toast } from 'react-toastify';

const useHouseworkerContact = (socket, isClient, userID, client_username) =>{

    const contactMessageRef = useRef(null);

    const onContactHandler = (e)=>{
        if(!isClient)
            toast.error("Uloguj se da bi poslao poruku",{
                className:"toast-contact-message"
            })
        else{   
        //    alert("Value: " + contactMessageRef.current.value);
            const messageFromContact = contactMessageRef.current.value

            if(messageFromContact!='')
            {
                //DUPLICATED CODE - MOVE IT ON SOCKET SOMETHING FILE
                const ourID = userID;
                //value prop of this button -> props.id 
                const houseworkerID = e.target.value;
                alert("USERNAME: " + client_username);

                console.log("HOUSEWORKERID " + houseworkerID);
                //Room based on users ID
                const RoomID = `${ourID}:${houseworkerID}`;
                const messageObj = {
                        message: messageFromContact,
                        from:ourID,
                        roomID:RoomID,
                        fromUsername:client_username
                }
                // alert(JSON.stringify(messageObj));
                emitMessage(socket, {messageObj});
                
                toast.success("The message is send",{
                    className:'toast-contact-message'
                })
                contactMessageRef.current.value='';
            }
            else
                toast.error("You cannot send the empty message",{
                    className:"toast-contact-message"
                })
        }   
    }

    return {contactMessageRef, onContactHandler}
}

export default useHouseworkerContact;