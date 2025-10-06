import { useEffect, useRef } from 'react';
import Photo from '../../utils/Photo';
import GroupsIcon from '@mui/icons-material/Groups';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import '../../sass/components/_room.scss';

const Room = ({
    info, 
    roomInfo, 
    unreadItem, 
    moreRoomUsers, 
    onRoomClickHanlder, 
    onShowMoreUsersFromChatHandler, 
    onUsersFromChatOutHanlder,
    roomsContainerRef
}) =>{
    const activeRoomRef = useRef(null);

    const isActive = info.roomID == roomInfo.roomID ? 'active' : "";
    const unreadCount = unreadItem ? unreadItem.count : null;

    useEffect(() => {
        if (isActive && activeRoomRef.current && roomsContainerRef?.current) {

            const container = roomsContainerRef.current;
            const activeElement = activeRoomRef.current;

            const containerHeight = container.clientHeight;
            const activeElementHeight = activeElement.clientHeight;
            
            // Calculate the position to scroll to (center the activeElement)
            const scrollTop = activeElement.offsetTop - container.offsetTop - (containerHeight / 2) + (activeElementHeight / 2);
            
            container.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });        
        }
    },[isActive, roomsContainerRef]);

    return(
        <>
            {info.users.length > 1 
            ?
            <div ref={isActive ? activeRoomRef : null} className={`room group ${isActive} ${unreadItem? 'unread' : ''}`} >
            {unreadCount &&     
            <div className='unread-mess'>
                <div className='unread-mess-count'>{unreadCount}</div>
            </div>
            }
            <div className={`group-sign ${isActive}-icon`}><GroupsIcon/></div>
            <button className='handler-surface' value={info.roomID} onClick={onRoomClickHanlder} />
                <div className ='user-photo-container'>
                    {moreRoomUsers?.users && moreRoomUsers.roomID == info.roomID &&
                        <div className='more-user-chat-container'>
                            {moreRoomUsers.users.map(el =>{
                                return(
                                    <div className='user-chat-label' key={`e-${el.username}`}>
                                        {el.online && <div className='online-user'></div>}
                                        <div>{el.username}</div>
                                    </div>
                                )
                            })
                            }
                        </div>
                    }
                    {/* for group room display user avatar with name and potential online status  */}
                    {info.users.length > 3 
                    ?
                    <> 
                        {info.users.slice(0,3).map((user) => 
                            {
                                return(
                                    <Photo
                                        key={`u-${user.username}`}
                                        username={user.username}
                                        picturePath={user.picturePath}
                                        online={user.online}
                                    />
                                )
                            })}
                        <div className="more-user">
                            <div className ='more-user-icon' onMouseEnter={() => onShowMoreUsersFromChatHandler({roomID:info.roomID, users:info.users.slice(3)})} onMouseLeave={() => onUsersFromChatOutHanlder()}> 
                                <MoreHorizIcon/>    
                            </div>
                        </div>
                    </>
                    :
                    <>
                        {info.users.map((user) => 
                            {
                                return(
                                    <Photo
                                        key={`us-${user.username}`}
                                        username={user.username}
                                        picturePath={user.picturePath}
                                        online={user.online}
                                    />
                                )
                            }
                        )}
                    </>
                    }
                </div>
                <div className={`timer ${info.users.length === 4 ? 'timer-bottom' : ''} `}>{info.lastMessage?.dateDiff || "just now"}</div>
                {/* <div className='unread-mess-count'>{unreadCount}</div> */}
            </div>
            :  
            <div className={`room ${isActive} ${unreadCount ? 'unread' : ''}`}>   
                <button className='handler-surface' value={info.roomID} onClick={onRoomClickHanlder} />
                {unreadCount &&
                <div className='unread-mess'>
                    <div className='unread-mess-count'>{unreadCount}</div>
                </div>
                }
                {/* IF PRIVATE THAT SHOW PROFILE PICTURE WITH NAME DESK */}       
                <div className='room-info'>
                    <div className="photo" style={{backgroundImage: `url(${info.users[0].picturePath})`}}>
                        {info.users[0].online && <div className="online"></div>} 
                    </div>
                    <div className="room-contact">
                        <p className="name">Name: {info.users[0].username}</p>
                        <p className="message">{info.lastMessage.message}</p>
                    </div>
                </div>
                <div className="timer">{info.lastMessage.dateDiff}</div>
                {/* <div>{unreadCount}</div> */}
            </div>
        }
        </>
    )
}


export default Room;