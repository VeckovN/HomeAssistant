import ClientHome from './ClientHome.js';
import HouseworkerHome from './HouseworkerHome.js';

const Home = ({socket, user}) =>{
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
