import ClientHome from "./Client/Home/ClientHome.js";
import HouseworkerHome from './Houseworker/HouseworkerHome';

const Home = ({socket, user}) =>{
    // const coo = Cookie.get("sessionLog");
    if(user === null)
        console.log("TESSSSSSSS");

    const isClient = user && user.type === 'Client' ? true : false;
   
    return (
        <>
            {isClient || user==null
                //if isn't client then is it a Guest(limited Client Home Page view)
                ? <ClientHome socket={socket} /> 
                // If is authenticated as Houseworker 
                : <HouseworkerHome/>
            }
        </>

        
    )
}


export default Home;
