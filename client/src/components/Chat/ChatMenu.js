import {useState} from 'react';

import '../../sass/components/_chatMenu.scss';

const ChatMenu = ({houseworkers, rooms, roomInfo, onAddUserToGroupHanlder, onKickUserFromGroupHandler, onDeleteRoomHandler}) =>{
    
    const [selectedUsername, setSelectedUsername] = useState(''); //clicked username form list
    const [searchTerm, setSearchTerm] = useState(''); // entered houseworker username(not selected)

    const [selectedKickUsername , setSelectedKickUsername] = useState('');
    const [searchKickTerm, setSearchKickTerm] = useState('');
 
    const SelectedHandler = (username) => setSelectedUsername(username); 
    const SelectedKickUserHandler = (username) => setSelectedKickUsername(username);

    const ChangeSearchInputHandler = (e, roomID) =>{
        if(selectedUsername!='')
            setSelectedUsername('')
        setSearchTerm(e.target.value);
    }

    const ChangeSearchKickInputHandler = (e, roomID) =>{
        if(selectedKickUsername!='')
            setSelectedKickUsername('')
        setSearchKickTerm(e.target.value);
    }

    const AddUserToGroupHandler = (roomID, username) =>{
        setSelectedUsername('');
        setSearchTerm('');
        onAddUserToGroupHanlder(roomID, username);
    }

    const KickUserFromGroupHandler = (roomID, username) =>{
        setSelectedKickUsername('');
        setSearchKickTerm('');
        onKickUserFromGroupHandler(roomID, username);
    }

    // useEffect(()=>{
    //     //cats users array from room obj
    //     const room = rooms.find(el => el.roomID === roomRef.current.value)
    //     setRoomInfo(room);
    //     console.log("ROOMINFO EFFECT, " , roomInfo);
    // },[roomRef]); 

    console.log("roomINFOOSODAODS ", roomInfo)
    
    return (
    <div className='chat-menu-container'>
        <div className='menu-option'> 
            <div className='add-user-container'> 
                <p className="menu-option-title">Add User </p>
                <div className="searchbar">
                    <i className="fa fa-search" aria-hidden="true"></i>
                    <input  
                        className='menu-search-input'
                        placeholder='Enter houseworker username'
                        type='text'
                        onChange={(e)=> ChangeSearchInputHandler(e, roomInfo.roomID)}  
                        value={selectedUsername!='' ? selectedUsername : searchTerm}                  
                    />
                </div>
                <div className='dropdown-list'>
                    {
                    houseworkers.filter(item => {
                        const searchInput = searchTerm.toLowerCase();
                        const usernameMatch = item.username.toLowerCase();

                        const usernameStartsWithSerachInput = searchInput && usernameMatch.startsWith(searchInput);
                        // const isNotInRoomUsers =!roomInfo.users.includes(item.username)
                        const isNotInRoomUsers = !roomInfo.users.some(user => user.username === item.username);
                        console.log("SUUUUUUUUU ", item.username);
                        console.log("isNotInRoomUsers", isNotInRoomUsers);
                        //also exclude the users that are memeber of group


                        return usernameStartsWithSerachInput && isNotInRoomUsers && selectedUsername==''
                    })
                    .map((item) =>(
                        <div className='dropdown-row'>
                            <div
                                key={item.id} 
                                onClick={() => SelectedHandler(item.username)}
                                className='dropdown-row-item'>{item.username}
                            </div>
                        </div>
                    ))
                    .slice(0,10)//render 10 items in list
                    }
                </div>
                <div className='user-button'>
                    <button 
                        className='add-user-to-group-btn'
                        onClick={()=> AddUserToGroupHandler(roomInfo.roomID, selectedUsername)}
                        disabled={!selectedUsername}
                        >Add user
                    </button>
                </div>
            </div>
        </div>

        {roomInfo.users.length > 1 &&
            <div className='menu-option'> 
                <div className='kick-user-container'>
                    <p className='menu-option-title'>Kick User </p>
                    <div className="searchbar">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input  
                            className='menu-search-input'
                            placeholder='Enter houseworker username'
                            type='text'
                            onChange={(e)=> ChangeSearchKickInputHandler(e, roomInfo.roomID)}   
                            value={selectedKickUsername!='' ? selectedKickUsername : searchKickTerm}                
                        />
                    </div>
                    <div className='dropdown-list'>
                        {
                        // show only room members 
                        roomInfo.users.filter(item => {
                            const searchInput = searchKickTerm.toLowerCase();
                            const usernameMatch = item.username.toLowerCase();

                            const usernameStartsWithSerachInput = searchInput && usernameMatch.startsWith(searchInput);
                            // const isNotInRoomUsers =!roomInfo.users.includes(item.username)

                            // return usernameStartsWithSerachInput && isNotInRoomUsers && selectedUsername==''
                            return usernameStartsWithSerachInput  && selectedKickUsername ==''
                        })
                        .map((item) =>(
                            <div
                                key={`user-${item.username}`} 
                                onClick={() => SelectedKickUserHandler(item.username)}
                                className='dropdown-row'>{item.username}
                            </div>
                        ))
                        .slice(0,5)//render 5 items in list
                        }
                    </div>
                    <div className='user-button'>
                        <button 
                            className='kick-user-from-group-btn'
                            onClick={()=> KickUserFromGroupHandler(roomInfo.roomID, selectedKickUsername)}
                            disabled={!selectedKickUsername}
                            >Kick user
                        </button>
                </div>
            </div>
        </div>
        }
        <div className='menu-option'>
            <div className='delete-container'>
                <p className='menu-option-title'>Delete Chat </p>
                <button className='delete-room-btn' onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
            </div>
        </div>
    </div>
    )
}
export default ChatMenu;