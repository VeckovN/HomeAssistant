import { ReactFragment, useEffect } from "react";
import { Router } from "react-router-dom";
import ClientHome from "./Client/Home/ClientHome.js";
import HouseworkerHome from './Houseworker/HouseworkerHome';
import {Routes, Route} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {toast} from 'react-toastify';
import useSocket from '../../hooks/useSocket';

import Cookie from 'js-cookie';


//CLIENT - Serach, Filter, HouseworkersCard(wiht paggination)
//GUEST sees everything just like THE CLIENT but 
// -can't see all information(Working hours, Rating) and cant send message and post comment
//HOUSEWORKER - Has own view, GeneralMessage, shortcuts(Cards) to view Messages,Comments and Ratings. 


//if there isn't type then is 100% Guest
//type=['client','houseworker']
const Home = ({socket, connected}) =>{

    const coo = Cookie.get("sessionLog");
    console.log("SEEEEEEEEESSSSSSSSSSSSPPPPPPPPPPPPP: " +  JSON.stringify(coo));

    const userAuth = useSelector((state) => state.auth) //null when not exists
    // const authUser = user.username ? true : false;
    // let client;
    // if(user.user)
    //     client = userAuth.user.type === 'Client' ? true : false;
    console.log("SSSSSSSSSSSSSSS: " + JSON.stringify(userAuth));
    
    if(userAuth.user === null)
        console.log("TESSSSSSSSS");

    let client;
    if(userAuth.user)
        client = userAuth.user.type === 'Client' ? true : false;
    //console.log("CHECL  " + JSON.stringify(authUser))

    //const [socket, connected] = useSocket(userAuth.user);
    //Message Receive Notification
    
    console.log("CONNECTED:: " + connected);

    useEffect(()=>{
        if(connected && userAuth.user){
            console.log("NOTIIIIIIIFYU")
            socket.on("messageResponseNotify", data =>{
                const dataObj = JSON.parse(data);
                console.log("message");
                //not show yourself
                if(userAuth.user.userRedisID != dataObj.from)
                {
                    //WE ARE 
                    console.log("WEE E " + JSON.stringify(userAuth.user))
                    console.log('WE ' + userAuth.user.userRedisID)
                    const roomIDs = dataObj.roomID
                    const rooms = roomIDs.split(':'); //indexes [0][1]
                    console.log("ROMSSSSS: " + JSON.stringify(rooms));
                    //show only members of message room(Are ourID is in RoomID)
                    console.log(">?> : " + rooms.includes(userAuth.user.userRedisID));
                    if(rooms.includes(userAuth.user.userRedisID))
                    {
                        //and we are 
                        console.log("Received message");
                        //find username by userID
                        //const receivedFrom = await getUsernameByUserID(data.from)
                        // toast.info("You received message from :" + receivedFrom);
                        toast.info("Stigla je poruka od :" + dataObj.fromUsername);
                    }
                }
                
            })
            socket.on("commentResponseNotify", data =>{
                //const idOfuser = data.id
                // console.log("IDDDD: " + houseworkerID);
                // console.log("REDIS ID: " + userAuth.user.userRedisID);
                const commentObj = JSON.parse(data);
                // const [houseworkerID, client] = commentObj;
                const houseworkerID  =commentObj.houseworkerID;
                const clientCommented = commentObj.client;

                // const houseworkerID = commentObj.houseworkerID;
                // const clientCommented = commentObj.client;

                console.log("IDDDD: " + houseworkerID);
                console.log("REDIS ID: " + userAuth.user.userRedisID);
                if(userAuth.user.userRedisID == houseworkerID){
                    console.log("HEEEEEE");
                    toast.info("Dobio si komentar od " + clientCommented)
                }
            })
        }
    },[socket, userAuth.user])
    
   
    return (
        <div>
            {/* SHOW ClientHome if is guest or client */}
            <Routes>
                <Route
                    path='/'
                    element ={
                        //client or guest(if is user null)
                        client || userAuth.user===null
                        // in ClientHome limit what Guest can do and see
                        ? <ClientHome socket={socket} /> 
                        // If is authenticated as Houseworker 
                        : <HouseworkerHome/>
                    }
                />
            </Routes>
        </div>
    )
}


export default Home;
