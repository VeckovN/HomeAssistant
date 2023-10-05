import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";
import { toast } from 'react-toastify';

//take user info from redux
const useSocket = (user) =>{

    const socketRef = useRef(null);
    const socket = socketRef.current;
    const [connected, setConnected] = useState(false);

    //on every useSocket will be this reRun
    useEffect(()=>{
        if(user){
            //if is socket initializated
            if(socket !== null){
                console.log("socket.connect();")
                socket.connect();

                //message send to all users and user which id is in message obj should
                socket.on("messageResponseNotify", (messageObj) =>{
                    console.log(messageObj);
                    const parsedObj = JSON.parse(messageObj);
                    const { message, from, roomID, fromUsername} = parsedObj;
                    const users = roomID.split(':');

                    //exclude sender from users notification
                    const notifyUsers = users.filter(el => el!=from);
                    //if our userID is in array of notifyUsers
                    if(notifyUsers.includes(user.userID)){
                        toast.info(`You received Message from ${fromUsername}`,{
                            className:"toast-contact-message"
                        })
                    }
                  })

                //listen only for comment that belongs to logged user
                socket.on(`privateCommentNotify-${user.userID}`, ({postComment}) =>{
                    toast.info(`You received Comment from ${postComment.client} `,{
                        className:"toast-contact-message"
                    })
                })

            }
            else{
                const socketIn = io("http://127.0.0.1:5000", {
                    withCredentials: true,
                });
                socketRef.current = socketIn
                console.log("socketRef.current = socketIn")
            }
        setConnected(true);
        }   
        //userNotExxists (Not authorized)
        else{
            console.log("HHHEEEEEE ELSEEEEEEEEEE");
            if(socket !== null){
                console.log("socket.disconnect();")
                socket.disconnect();
            }
            // console.log("setConnected(false);")
        }

        // return () => {
        //     socket.disconnect();
        //   };

    },[socket,user])

    useEffect(()=>{

        if(connected && user){

        }
        else{
            if(socket){
                socket.off("user.connected");
                socket.off("message");
                socket.off("user.room");
            }
        }

    },[])


    //return socketOBj, and connected State
    return [socket,connected];

}

export default useSocket