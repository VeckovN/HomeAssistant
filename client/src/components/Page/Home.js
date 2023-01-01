import { ReactFragment } from "react";
import ClientHome from "./Client/ClientHome.js";


//CLIENT - Serach, Filter, HouseworkersCard(wiht paggination)
//GUEST sees everything just like THE CLIENT but 
// -can't see all information(Working hours, Rating) and cant send message and post comment
//HOUSEWORKER - Has own view, GeneralMessage, shortcuts(Cards) to view Messages,Comments and Ratings. 


//if there isn't type then is 100% Guest
//type=['client','houseworker']
const Home = () =>{
    return (
        <div>
            {/* Guest sees same as Client but with limitation(can't see all infos and send messages,comments) */}
            
            {/* {type=='client' || type=='undefined' && <ClientHome />}
            {type=='houseworker' && <HouseworkerHome/>} */}

            <ClientHome/>
            

        </div>
    )
}


export default Home;
