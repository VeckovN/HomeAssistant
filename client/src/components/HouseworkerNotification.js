import {useState, useEffect} from 'react';
import {useDispatch, useSelector } from 'react-redux';
import { NavLink} from "react-router-dom";

import '../sass/components/_notification.scss';

const HouseworkerNotification = () =>{

    const dispatch = useDispatch();
    const {notifications, unreadNotificationsCount} = useSelector((state) => state.notifications)
    const [isOpen, setIsOpen] = useState(false);

    console.log("Notifications:", notifications);

    const isOpenHandler = () =>{
        setIsOpen(prev => !prev);
    }

    const returnPath = (type) =>{
        //use navLInk to go to the page based on type
        // <NavLink to={} key={'el-'}></NavLink>
        let path;
        if(type === 'comment')
            path = "/comments"
        else if(type === 'chatGroup')
            path = "/messages"
        else if(type === 'rating'){
            path ="/";
        }
        
        console.log("PATH: ", path + ' type:', type);
        return path;
    }

    // useEffect(()=>{
    //         //re-render notification when it's notification state changed:
    //         //on markUnreadNotification
    //         //on newNotification (when its arrived )
    //         //on loadMoreNotifications (when is scrolled )
    // },[notifications])

    return(
        //SHow only Unread Count when is closed
        <div className='notification-unread-count-box'>
            <div className='notification-icon' onClick={isOpenHandler}>
                {unreadNotificationsCount}
            </div>
            {isOpen && 
            <div className='notification-box'>
                <div className='notification-list'>
                    {notifications.map(el =>(
                        // <div className='notification' onClick={goToPage(el.type)}>
                        //     <div> {el.message}</div>
                        // </div>
                        
                        <NavLink to={returnPath(el.type)} className='notification' >
                            <div> {el.message}</div>
                        </NavLink>
                    ))}
                </div>
            </div>
            }
        </div>
    )

}

export default HouseworkerNotification;