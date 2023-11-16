import {useState} from 'react';

import '../../../../../sass/components/_room.scss';

const Room = ({roomInfo, user, houseworkers, roomRef, onRoomClickHanlder, onAddUserToGroupHanlder, onDeleteRoomHandler}) =>{

    console.log("searchTerm : " )

    //Every room has our own selectedUsername - we cann add user to group in multiple room
    const [selectedUsername, setSelectedUsernam] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); 

    const onSelectedHandler = (username) =>{
        setSelectedUsernam(username);
        console.log("ROOM_ID: " + roomInfo.roomID + " SELECTED_USERNAME: " + username)    
    }

    const ChangeSearchInputHandler = (e, roomID) =>{
        if(selectedUsername!='')
            setSelectedUsernam('')
        roomRef.current = roomID; 
        setSearchTerm(e.target.value);
    }

    const AddUserToGroupHandler = (roomID, selectedUsername) =>{
        setSelectedUsernam('');
        setSearchTerm('');
        onAddUserToGroupHanlder(roomID, selectedUsername)
    }


    return(

        <>
            {roomInfo.users.length > 1 
            ?
                //For Private
            <div className ='room active'>
                {/* IF PRIVATE THAT SHOW PROFILE PICTURE WITH NAME DESK */}
                <div className="photo" src={`assets/userImages/`}>
                {/* <div className="photo" src={`assets/userImages/${houseworkerProps.picturePath}`}> */}
                    {/* Green dot for online user */}
                    <div className="online"></div> 
                </div>
                <div className="room-contact">
                    <p className="name"></p>
                    {/* last message */}
                    <p className="message">9 pm at the bar if possible 😳</p>
                </div>
                {/* timer for the last received message */}
                <div className="timer">12 sec</div>
            </div>

            :
            <div className="room group">
                //For Group
                {roomInfo.users.map((user) => 
                {
                    <>
                        <div className="photo" style={{backgroundImage: "url(https://i.pinimg.com/originals/a9/26/52/a926525d966c9479c18d3b4f8e64b434.jpg)"}}>
                            <div className="online">{user}</div>
                            {/* <div className="online"></div> */}
                        </div>
                        {/* <div class="desc-contact">
                            <p class="name">Dave Corlew</p>
                            <p class="message">Let's meet for a coffee or something today ?</p>
                        </div> */}
                    </>
                })}
                <div className="timer">3 min </div>
                {/* <div className="timer">3 min {roomInfo.lastMessageTime}</div> */}
            </div>
        }
        </>

        // <>      
        //    {/* Manage the active - clicked(displayed) room -> on inital set first room as selected*/}
        //    {/* active - message of that user is showned in chat section */}
        //         <div className ='room active'>
        //             {/* IF PRIVATE THAT SHOW PROFILE PICTURE WITH NAME DESK */}
        //             <div className="photo" src={`assets/userImages/`}>
        //             {/* <div className="photo" src={`assets/userImages/${houseworkerProps.picturePath}`}> */}
        //                 {/* Green dot for online user */}
        //                 <div className="online"></div> 
        //             </div>
        //             <div className="room-contact">
        //                 <p className="name">Megan Leib</p>
        //                 <p className="message">9 pm at the bar if possible 😳</p>
        //             </div>
        //             {/* timer for the last received message */}
        //             <div className="timer">12 sec</div>
        //         </div>

        //         {/* FOR GROUP ROOMS */}
        //         <div className="room group">
        //             <div className="photo" style="background-image: url(https://i.pinimg.com/originals/a9/26/52/a926525d966c9479c18d3b4f8e64b434.jpg);">
        //                 <div className="online"></div>
        //             </div>

        //             <div className="photo" style="background-image: url(https://i.pinimg.com/originals/a9/26/52/a926525d966c9479c18d3b4f8e64b434.jpg);">
        //                 <div className="online"></div>
        //             </div>

        //             <div className="photo" style="background-image: url(https://i.pinimg.com/originals/a9/26/52/a926525d966c9479c18d3b4f8e64b434.jpg);">
        //                 <div className="online"></div>
        //             </div>
        //             {/* <div class="desc-contact">
        //                 <p class="name">Dave Corlew</p>
        //                 <p class="message">Let's meet for a coffee or something today ?</p>
        //             </div> */}
        //             <div className="timer">3 min</div>
        //         </div>

        // </>


        // <>
        //     <div className='users'>{roomInfo.users.map((user)=>  (<div className='roomUsers'> -{user}:{}- <span/></div>))}</div>
        //     <div className='room-buttons'>
        //         <button className='show-room-btn' value={roomInfo.roomID} ref={roomRef} onClick={onRoomClickHanlder}>Show messages</button>
        //         {/* client can delete The chat room, add houseworker to group */}
        //         {user.type=="Client" &&
        //             <>                        
        //                 <div className='search-container'> 
        //                         {roomInfo.roomID == roomRef.current ?
        //                         <>
        //                             <input  
        //                                 placeholder='Enter houseworker username'
        //                                 type='text' 
        //                                 onChange={(e)=> ChangeSearchInputHandler(e, roomInfo.roomID)}
        //                                 value={selectedUsername!='' ? selectedUsername : searchTerm} 
        //                             />

        //                             <div className='dropdown-list'>
        //                                 {
        //                                 houseworkers.filter(item => {
        //                                     const searchInput = searchTerm.toLowerCase();
        //                                     const usernameMatch = item.username.toLowerCase();

        //                                     const usernameStartsWithSerachInput = searchInput && usernameMatch.startsWith(searchInput);
        //                                     const isNotInRoomUsers =!roomInfo.users.includes(item.username)

        //                                     return usernameStartsWithSerachInput && isNotInRoomUsers && selectedUsername==''
        //                                 })
        //                                 .map((item) =>(
        //                                     <div
        //                                         key={item.id} 
        //                                         onClick={() => onSelectedHandler(item.username)}
        //                                         className='dropdown-row'>{item.username}
        //                                     </div>
        //                                 ))
        //                                 .slice(0,10)//render 10 items in list
        //                                 }
        //                             </div>
        //                         </>
        //                         :
        //                             <input  
        //                                 placeholder='Enter houseworker username'
        //                                 type='text'
        //                                 onChange={(e)=> ChangeSearchInputHandler(e, roomInfo.roomID)}  
        //                                 value={searchTerm}                    
        //                             />
        //                         }
        //                 </div>
        //                 <button 
        //                     onClass='add-user-to-group-btn'
        //                     onClick={()=> AddUserToGroupHandler(roomInfo.roomID, selectedUsername)}
        //                     disabled={!selectedUsername}
        //                     >Add user
        //                 </button>
        //                 <button onClass='delete-room-btn' onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
        //             </>
        //         }
        //     </div>
        // </>
    )
}

export default Room;