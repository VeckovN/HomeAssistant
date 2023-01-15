import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";

//take user info from redux
const useSocket = (user) =>{

    const socketRef = useRef(null);
    const socket = socketRef.current;
    const [connected, setConnected] = useState(false);

    useEffect(()=>{
        console.log("US: " + JSON.stringify(user));
        console.log("SS: " + user);
        console.log("S@: " + !user );
        if(user){
            //if is socket initializated
            if(socket !== null){
                console.log("socket.connect();")
                socket.connect();
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
            if(socket !== null){
                console.log("socket.disconnect();")
                socket.disconnect();

            }
            console.log("setConnected(false);")
        }
    },[user, socket])


    //return socketOBj, and connected State
    return [socket,connected];

}

export default useSocket