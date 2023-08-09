import axios from 'axios';
import url from 'url';
import { useState } from "react"
import useClient from '../../../../hooks/useClient.js';
import HouseworkerCard from './HouseworkerCard/HouseworkerCard.js'
import Filter from './Filter/Filter.js';
import SearchAndSort from './SearchAndSort/SearchAndSort.js';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import './ClientHome.css'

const ClientHome = ({socket}) =>{

    //LIMIT IF IS GUEST 
    console.log("SOCKET " + socket);

    //const userAuth = useSelector((state) => state.auth.user)
    const {user} = useSelector((state) => state.auth)
    const {data, recommended, showRecommended, onShowRecommended, searchDataHanlder, filterDataHandler } = useClient(user);


    //RECOMMENDED USERS
    let recommendedList;
    {recommended ? 
        recommendedList = recommended.map(user =>
            <>
            {console.log("ID::: " + user.id)}
            <HouseworkerCard
                recommended={true}
                socket={socket}
                key={user.id}
                id={user.id}
                username={user.username}
                email={user.email}
                first_name={user.first_name}
                last_name={user.last_name}
                description={user.description}
                picturePath={user.picturePath}
                gender={user.gender}
                city={user.city}
                address={user.address}
                age={user.age}
                phone_number={user.phone_number}
                professions={user.professions}
            />
            </>
            )
            : recommendedList =[]
    }
    
    //HOUSEWORKER USERS
    let houseworkerList;
    {data ? 
        houseworkerList = data.map(user =>
            <>
            {console.log("ID::: " + user.id)}
            <HouseworkerCard
                recommended={false}
                socket={socket}
                key={user.id}
                id={user.id}
                username={user.username}
                email={user.email}
                first_name={user.first_name}
                last_name={user.last_name}
                description={user.description}
                picturePath={user.picturePath}
                gender={user.gender}
                city={user.city}
                address={user.address}
                age={user.age}
                phone_number={user.phone_number}
                professions={user.professions}
            />
            </>
            )
            : houseworkerList =[]
    }

    return (
        <div className='home_container'>
                {/* {searchedData && <h3>Search:{JSON.stringify(searchedData)}</h3>} */}
                <button className="recommendedBtn" onClick={onShowRecommended}>{!showRecommended ? 'Show recommended' : 'Close Recommended'}</button>
                <SearchAndSort search={searchDataHanlder}/>
                <div className='filter_houseworkers_container'>
                    <Filter 
                        filterOptions={filterDataHandler}
                    />
                    <div className="houseworker-list">
                        {showRecommended && recommendedList}
                        {houseworkerList.length > 0 ? houseworkerList : <h3>No Matches</h3> }
                    </div>

                </div>
                
        </div>
    )
    
}

export default ClientHome