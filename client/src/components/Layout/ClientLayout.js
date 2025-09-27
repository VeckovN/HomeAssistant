import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const ClientLayout = () =>{
    return(
        <>
            <Header></Header>
            <Outlet/>
            <Footer></Footer>
        </>
    )
}

export default ClientLayout;