
import '../../../../../sass/components/_room.scss';
import Photo from '../../../../../utils/Photo';
import GroupsIcon from '@mui/icons-material/Groups';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const Room = ({info, roomInfo, moreRoomUsers, onRoomClickHanlder, onShowMoreUsersFromChatHandler, onUsersFromChatOutHanlder}) =>{

    const isActive = info.roomID == roomInfo.roomID ? 'active' : "";

    console.log("USER INFOOOO : " ,info);

    return(
        <>
            {info.users.length > 1 
            ?
            // Group Room
            <div className={`room group ${isActive}`} >
            <div className={`group-sign ${isActive}-icon`}><GroupsIcon/></div>
            {console.log("USER: aaaaa " , info)}
            <button className='handler-surface' value={info.roomID} onClick={onRoomClickHanlder} />
                <div className ='user-photo-container'>
                    {moreRoomUsers?.users && moreRoomUsers.roomID == info.roomID &&
                        <div className='more-user-chat-container'>
                            {moreRoomUsers.users.map(el =>{
                                console.log("elLELEL :" , el);
                                return(
                                    <div className='user-chat-label'>
                                        {el.username}
                                    </div>
                                )
                            })
                            }
                        </div>
                    }
                    {info.users.length > 3 ?
                    <>
                        {info.users.slice(0,3).map((user) => 
                            {
                                return(
                                <>
                                    <Photo
                                        username={user.username}
                                        picturePath={user.picturePath}
                                    />
                                </>
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
                                <>
                                    <Photo
                                        username={user.username}
                                        picturePath={user.picturePath}
                                    />
                                </>
                                )
                            })}
                    </>
                    }
                    
                </div>
                <div className="timer">3 min </div>
                {/* <div className="timer">3 min {info.lastMessageTime}</div> */}
            </div>

            :  
    
            <div className={`room ${(info.roomID == roomInfo.roomID) ? 'active' : ""}`}>   
                <button className='handler-surface' value={info.roomID} onClick={onRoomClickHanlder} />
        
                {/* IF PRIVATE THAT SHOW PROFILE PICTURE WITH NAME DESK */}       
                <div className='room-info'>
                    <div className="photo" style={{backgroundImage: `url(assets/userImages/${info.users[0].picturePath})`}}>
                    {/* <div className="photo" src={`assets/userImages/${houseworkerProps.picturePath}`}> */}
                        {/* Green dot for online user */}
                        <div className="online"></div> 
                    </div>
                    <div className="room-contact">
                        {/* <p className="name">Name: {info.users[0]}</p> */}
                        <p className="name">Name: {info.users[0].username}</p>
                        {/* last message */}
                        {/* <p className="message">9 pm at the bar if possible 😳</p> */}
                        <p className="message">Last message</p>
                    </div>
                </div>
                {/* timer for the last received message */}
                <div className="timer">12 sec</div>
            </div>

        }
        </>
    )
}


export default Room;