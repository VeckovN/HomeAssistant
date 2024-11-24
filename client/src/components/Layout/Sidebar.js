import { useState} from "react";
import { NavLink, Outlet} from "react-router-dom";
import {useDispatch, useSelector} from 'react-redux';
import {logout} from '../../store/auth-slice'
import { resetNotifications } from '../../store/notificationsSlice';
import { resetUnreadComments } from '../../store/unreadCommentSlice';
import { resetUnreadMessages } from '../../store/unreadMessagesSlice';
import { resetReduxStates } from "../../store/reset-states";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { faMessage } from '@fortawesome/free-solid-svg-icons';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faBell} from '@fortawesome/free-solid-svg-icons';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';

import CottageIcon from '@mui/icons-material/Cottage';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import KeyboardArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardArrowLeftOutlined';

import HouseworkerNotification from "../HouseworkerNotification/HouseworkerNotification.js";

import '../../sass/layout/_sidebar.scss';

const Sidebar = () => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const {unreadCount} = useSelector((state) => state.unreadMessages);
    const {unreadCommentsCount} = useSelector((state) => state.unreadComments)
    const {unreadNotificationsCount} = useSelector((state) => state.notifications)
    const [isOpenNotification, setIsOpenNotification] = useState(false);

    const isOpenNotificationHandler = () =>{
        setIsOpenNotification(prev => !prev);
    }

    const closeNotificationHandler = () =>{
        setIsOpenNotification(false);
    }

    const closeOpenedViewsHandler = () =>{
        setIsOpenNotification(false);
        setIsOpen(false);

    }

    const toogleSideBarMenuHanlder = () =>{
        setIsOpen(!isOpen)
        if(isOpenNotification)
            setIsOpenNotification(false);
    }

    const logoutHandler = () =>{
        resetReduxStates(dispatch);
        dispatch(logout());
    }

    const menuItem1 = [
        {
            path:"/", //link to
            name:"Home",
            icon:<FontAwesomeIcon icon={faHouse}/>,
        },
        {
            path:"/messages",
            name:"Messages",
            unreadMessageCount:unreadCount,
            icon:<FontAwesomeIcon icon={faMessage}/>,
        },
        {
            path:"/comments",
            name:"Comments",
            unreadCommentsCount:unreadCommentsCount,
            icon:<FontAwesomeIcon icon={faComments} />,
        }
    ];

    const menuItem2 =[
        {
            path:"/profile",
            name:"Settings",
            icon:<FontAwesomeIcon icon={faSliders} />,

        },
        {
            path:"/a",
            name:"HelpCenter",
            icon:<FontAwesomeIcon icon={faCircleInfo} />,
        },
    ]

    return(
        <main className='sidebar-container'>
            <div className={`nav-button ${!isOpen ? 'close-nav-button' : ''}`} onClick={toogleSideBarMenuHanlder}>
                <div className='nav-button-icon'>{!isOpen ? <KeyboardArrowRightOutlinedIcon fontSize="inherit"/> : <KeyboardArrowLeftOutlinedIcon fontSize="inherit"/>}</div>
            </div>
            <section className={`section-menu ${!isOpen ? 'section-menu-close' : ''}`} >

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
                        <div className='notification-icon-container' onClick={isOpenNotificationHandler}>
                            <div className='notification-icon'>
                                <FontAwesomeIcon icon={faBell} />
                                {unreadNotificationsCount !== 0 &&
                                <div className='notifications-unread-count'>
                                    {unreadNotificationsCount}
                                </div>
                                }
                            </div>
                            
                        </div>
                        {
                            menuItem1.map((el, index) =>(
                                // <NavLink to={el.path} onClick={()=> setIsOpen(false)} key={'el-'+index}  
                                <NavLink to={el.path} onClick={closeOpenedViewsHandler} key={'el-'+index}  
                                    className={({ isActive}) =>
                                    isActive ? "sidebar-menu-link active-link" : "sidebar-menu-link"
                                }>
                                    <div className='sidebar-menu-icon'>{el.icon}</div>
                                    <div className='sidebar-menu-name'>{el.name}</div>
                                    {el.unreadMessageCount >0 && <div className='sidebar-menu-unread'>{el.unreadMessageCount}</div>}
                                    {el.unreadCommentsCount >0 && <div className='sidebar-menu-unread'>{el.unreadCommentsCount}</div>}
                                </NavLink>
                            ))
                        }
                    </div>

                    <div className='line'/>

                    <div className="menu-option">
                        {
                             menuItem2.map((el, index) =>(
                                // <NavLink to={el.path} onClick={()=> setIsOpen(false)} key={'el-'+index}
                                <NavLink to={el.path} onClick={closeOpenedViewsHandler} key={'el-'+index}
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
                            <div className='sidebar-menu-icon'><FontAwesomeIcon icon={faArrowRightFromBracket} /></div>
                            <div className='sidebar-menu-name'>Logout</div>
                        </div>
                        
                    </div>
                </div>
            </section>
            
            <section className='sidebar-context-container'>
                {isOpenNotification &&  
                    <div className='notifications-container'>
                        <HouseworkerNotification closeNotifications={closeNotificationHandler}/>
                    </div>
                }
                <Outlet />
            </section>
        </main>
    )

}

export default Sidebar;