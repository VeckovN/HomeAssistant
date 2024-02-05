import { Outlet } from "react-router-dom";
import Header from "./Header";

const ClientLayout = () =>{

    return(
        <>
            <Header></Header>
            <Outlet/>
        </>
    )
}

export default ClientLayout;