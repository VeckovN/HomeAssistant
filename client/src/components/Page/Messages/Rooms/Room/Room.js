import {useState, memo} from 'react';

import '../../../../../sass/components/_room.scss';
import PhotoWithHover from '../../../../../utils/PhotoWithHover';

const Room = ({info, roomInfo, onRoomClickHanlder}) =>{
    return(
        <>
            {info.users.length > 1 
            ?
            // Group Room
            <div className={`room group ${(info.roomID == roomInfo.roomID) ? 'active' : ""}`} >
            {console.log("USER: aaaaa " , info)}
            <button className='handler-surface' value={info.roomID} onClick={onRoomClickHanlder} />
                {info.users.map((user) => 
                {
                    return(
                    <>
                        <div className='group-sign'>Group</div>
                        <PhotoWithHover
                            url="url(https://i.pinimg.com/originals/a9/26/52/a926525d966c9479c18d3b4f8e64b434.jpg)"
                            user={user}
                        />
                    </>
                    )
                })}
                <div className="timer">3 min </div>
                {/* <div className="timer">3 min {info.lastMessageTime}</div> */}
            </div>

            :  
    
            <div className={`room ${(info.roomID == roomInfo.roomID) ? 'active' : ""}`}>   
                <button className='handler-surface' value={info.roomID} onClick={onRoomClickHanlder} />
        
                {/* IF PRIVATE THAT SHOW PROFILE PICTURE WITH NAME DESK */}       
                <div className='room-info'>
                    <div className="photo" style={{backgroundImage: "url(https://images.unsplash.com/photo-1497551060073-4c5ab6435f12?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=667&q=80)"}}>
                    {/* <div className="photo" src={`assets/userImages/${houseworkerProps.picturePath}`}> */}
                        {/* Green dot for online user */}
                        <div className="online"></div> 
                    </div>
                    <div className="room-contact">
                        <p className="name">Name: {info.users[0]}</p>
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