import {useRef} from 'react';
import { toast } from 'react-toastify';

const useHouseworkerContact = (socket, isClient, userID) =>{

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
                const ourID = userID;
                //value prop of this button -> props.id 
                const houseworkerID = e.target.value;

                console.log("HOUSEWORKERID " + houseworkerID);
                //Room based on users ID
                const RoomID = `${ourID}:${houseworkerID}`;
                const messageObj = {
                        message: messageFromContact,
                        from:ourID,
                        roomID:RoomID
                }
                // alert(JSON.stringify(messageObj));
                socket.emit('message', JSON.stringify(messageObj))
                toast.success("Poruka je poslata",{
                    className:'toast-contact-message'
                })
                contactMessageRef.current.value='';
            }
            else
                toast.error("Ne mozes poslati praznu poruku",{
                    className:"toast-contact-message"
                })
        }   
    }

    return {contactMessageRef, onContactHandler}
}

export default useHouseworkerContact;