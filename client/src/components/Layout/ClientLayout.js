import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

import '../../sass/layout/_clientLayout.scss';

const ClientLayout = () =>{
    const location = useLocation();
    const isMessagesPage = location.pathname === '/messages';

    return(
        <div className='client-layout-wrapper'>
            <Header />
            <main className='client-layout-content'>
                <Outlet />
            </main>
            {!isMessagesPage && <Footer />}
        </div>
    )
}

export default ClientLayout;