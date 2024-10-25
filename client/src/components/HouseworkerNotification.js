import {useState, useEffect} from 'react';
import {useDispatch, useSelector } from 'react-redux';
import { NavLink} from "react-router-dom";
import { getMoreHouseworkerNotifications, markNotification} from '../store/notificationsSlice';

import '../sass/components/_notification.scss';

const HouseworkerNotification = () =>{

    const dispatch = useDispatch();
    const {notifications, unreadNotificationsCount} = useSelector((state) => state.notifications)
    const {user} = useSelector((state) => state.auth)
    const [isOpen, setIsOpen] = useState(false);
    const [batchNumber, setBatchNumber] = useState(0);

    const isOpenHandler = () =>{
        setIsOpen(prev => !prev);
    }

    const loadMoreNotifications = () => {
        const username = user.username;
        const newBatchNumber = batchNumber + 1;
        dispatch(getMoreHouseworkerNotifications({username, batchNumber:newBatchNumber}));
        setBatchNumber(newBatchNumber);
    }

    const markNotificationHanlder = (notificationID) => {
        dispatch(markNotification({notificationID, batchNumber}));
    }

    const returnPath = (type) =>{
        let path;
        if(type === 'comment')
            path = "/comments"
        else if(type === 'chatGroup')
            path = "/messages"
        else{
            path = "/";
        }
        return path;
    }

    return(
        <div className='notification-unread-count-box'>
            <div className='notification-icon' onClick={isOpenHandler}>
                {unreadNotificationsCount}
            </div>
            {isOpen && 
            <div className='notification-box'>
                <div className='notification-list'>
                    {notifications.map(el =>
                        el.read    
                        ? (
                            <NavLink  to={returnPath(el.type)} className='notification'>
                                <div className={`message `}> {el.message } --- {el.id}</div>
                            </NavLink>
                        ) : (
                            <NavLink onClick={() => markNotificationHanlder(el.id)} to={returnPath(el.type)} className='notification'>
                                <div className={`message un-read`}> {el.message } --- {el.id}</div>
                            </NavLink>
                        )
                    )}
                </div>
                <div className='notification-more-btn-container'>
                    <button onClick={loadMoreNotifications} className='more-btn'>More</button>
                </div>
            </div>
            }
        </div>
    )

}

export default HouseworkerNotification;