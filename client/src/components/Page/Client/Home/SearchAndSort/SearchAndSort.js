//component with Sort Buttons (By Age and Rating)
//and in extension with serach bar

import {useEffect, useState, useRef} from 'react'

import './SearchAndSort.css'

const SearchAndSort = (prop) => {

    // const [option, setOption] = useState({});

    //won't to reRender this component on input Change, only to send data to Parent(ClientHome) compoennt
    //this is reason why is useRef in use instead useState
    const valueRef = useRef();
    const [searchName, setSearchName] = useState('');
    
    const selectSortHandler = (opt) =>{
        console.log("OPTION: " + opt);
        //send selected option to parrent (searchDataHanlder(searchDataObj))
        prop.search({sort:opt}); 
    }

    const selectSearchHandler = (e)=>{
        setSearchName(e.target.value);
    }

    const onSearchSubmitHandler = () =>{
        prop.search({name:searchName});
    }

    return (
        <>
            <div class='search-box'>
                <div class='input-search'>
                    <div class='box_s'>
                    <input 
                        class='search' 
                        type='text' 
                        value={searchName}
                        placeholder='Search houseworker (Enter username)'
                        onChange={selectSearchHandler}
                    />
                    <button onClick={onSearchSubmitHandler}>Search</button>
                    </div>
                </div>

                <div class='sort'>
                    <div class="sort-box">
                        <button class='sort-1' value="AgeUp" onClick={e => selectSortHandler(e.target.value)}>Age 🠑
                        </button>

                        <button class='sort-2' value="AgeDown" onClick={e => selectSortHandler(e.target.value)}>Age 🠓
                        </button>

                        <button class='sort-3' value="RatingUp" onClick={e => selectSortHandler(e.target.value)}>Rating 🠑
                        </button>

                        <button class='sort-4' value="RatingDown" onClick={e => selectSortHandler(e.target.value)}>Rating 🠓
                        </button>
                    </div>
                </div>

            </div>        
        </>
    )
} 

export default SearchAndSort