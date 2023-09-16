import {useEffect } from "react";
import ClientHome from "./Client/Home/ClientHome.js";
import HouseworkerHome from './Houseworker/HouseworkerHome';
import {Routes, Route} from 'react-router-dom';
import {toast} from 'react-toastify';


//CLIENT - Serach, Filter, HouseworkersCard(wiht paggination)
//GUEST sees everything just like THE CLIENT but 
// -can't see all information(Working hours, Rating) and cant send message and post comment
//HOUSEWORKER - Has own view, GeneralMessage, shortcuts(Cards) to view Messages,Comments and Ratings. 


//if there isn't type then is 100% Guest
//type=['client','houseworker']
const Home = ({socket, connected, user}) =>{
    // const coo = Cookie.get("sessionLog");
    if(user === null)
        console.log("TESSSSSSSS");

    let client;
    if(user)
        client = user.type === 'Client' ? true : false;

    useEffect(()=>{
        if(connected && user){
            console.log("NOTIIIIIIIFYU")
            socket.on("commentResponseNotify", data =>{
                const commentObj = JSON.parse(data);
                const houseworkerID  =commentObj.houseworkerID;
                const clientCommented = commentObj.client;

                if(user.userID == houseworkerID){
                    console.log("HEEEEEE");
                    toast.info("Dobio si komentar od " + clientCommented)
                }
            })
        }
    },[socket, user])
    
   
    return (
        <div>
            {client || user===null
                // in ClientHome limit what Guest can do and see
                ? <ClientHome socket={socket} /> 
                // If is authenticated as Houseworker 
                : <HouseworkerHome/>
            }
        </div>

        
    )
}


export default Home;
