import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {useDispatch} from 'react-redux';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CottageIcon from '@mui/icons-material/Cottage';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import {logout} from '../../store/auth-slice'

import '../../sass/layout/_sidebar.scss';

 
const Sidebar = () => {
    const dispatch = useDispatch();

    const logoutHandler = () =>{
        dispatch(logout());
    }

    const menuItem1 = [
        {
            path:"/", //link to
            name:"Home",
            icon:<HomeOutlinedIcon fontSize='inherit'/>,
        },
        {
            path:"/messages",
            name:"Messages",
            icon:<ForumOutlinedIcon fontSize='inherit'/>,
        },
        {
            path:"/comments",
            name:"Comments",
            icon:<CommentOutlinedIcon fontSize='inherit'/>,
        }
    ];

    const menuItem2 =[
        {
            path:"/profile",
            name:"Settings",
            icon:<TuneIcon fontSize='inherit'/>,
        },
        {
            path:"/a",
            name:"HelpCenter",
            icon:<ContactSupportOutlinedIcon fontSize='inherit'/>,
        },
    ]


    return(
        <main className='sidebar-container'>
            <section className='section-menu'>

                <div className='sidebar-logo'>
                    <div className='logo-icon'>
                        <CottageIcon fontSize='inherit'/>
                    </div>
                    <div className='logo-text'>
                        <span className='logo-span'>Home</span> 
                        <span className="logo-span">Assistant</span>
                    </div>
                   
                </div>
                <div className='sidebar-menu'>
                    <div className="menu-option">
                        {/* Link to page */}
                        {
                             menuItem1.map((el, index) =>(
                                <NavLink to={el.path} key={'el-'+index}  
                                    className={({ isActive}) =>
                                    isActive ? "sidebar-menu-link active-link" : "sidebar-menu-link"
                                }>
                                    <div className='sidebar-menu-icon'>{el.icon}</div>
                                    <div className='sidebar-menu-name'>{el.name}</div>
                                </NavLink>
                            ))
                        }
                    </div>

                    <div className='line'/>

                    <div className="menu-option">
                        {
                             menuItem2.map((el, index) =>(
                                <NavLink to={el.path} key={'el-'+index}
                                    className={({ isActive}) =>
                                    isActive ? "sidebar-menu-link active-link" : "sidebar-menu-link"
                                }>
                                    <div className='sidebar-menu-icon'>{el.icon}</div>
                                    <div className='sidebar-menu-name'>{el.name}</div>
                                </NavLink>
                            ))
                        }
                        <div className='line'/>
                        <div className='sidebar-menu-link logout' onClick={logoutHandler}>
                            <div className='sidebar-menu-icon'><LogoutOutlinedIcon fontSize="inherit"/></div>
                            <div className='sidebar-menu-name'>Logout</div>
                        </div>
                        
                    </div>
                </div>
            </section>
            
            {/* HERE IS CONTAINER WHERE PAGE SHOULD BE DISPLAYED */}
            <section className='sidebar-context-container'>
                {/* {children} */}
                <Outlet />
            </section>
        </main>
    )

}

export default Sidebar;