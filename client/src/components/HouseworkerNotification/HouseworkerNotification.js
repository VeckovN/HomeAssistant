import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from "react-router-dom";
import { getMoreHouseworkerNotifications, markNotification} from '../../store/notificationsSlice';
import NotificationList from './NotificationList';

import '../../sass/components/_notification.scss';

const HouseworkerNotification = ({closeNotifications}) =>{

    const dispatch = useDispatch();
    const {notifications, totalNotificationsCount, batchNumber} = useSelector((state) => state.notifications)
    const {user} = useSelector((state) => state.auth)
    const navigator = useNavigate();

    const loadMoreNotifications = () => {
        const username = user.username;
        const newBatchNumber = batchNumber + 1;
        dispatch(getMoreHouseworkerNotifications({username, batchNumber:newBatchNumber}));
    }

    const handleNotificationClick = (path, notificationID) =>{
        if(notificationID){ //when notification is unread
            dispatch(markNotification({notificationID, batchNumber}));
        }

        navigator(path);
        closeNotifications();
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
        <div className='notification-box'>
            <div className='notification-box-title'>
                Notifications
            </div>
            
            {notifications.length > 0 ?(
                <NotificationList 
                    notifications = {notifications}
                    handleNotificationClick = {handleNotificationClick}
                    returnPath = {returnPath}
                />
            ) : (
                <div className='notifications-empty-list'>
                    You have no notifications
                </div>
            )}
            
            {totalNotificationsCount > notifications.length  &&
                <div className='notification-more-btn-container'>
                    <button onClick={loadMoreNotifications} className='more-btn'>More</button>
                </div>
            }
        </div>
    )
}

export default HouseworkerNotification;