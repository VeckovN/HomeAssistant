//component with Sort Buttons (By Age and Rating)
//and in extension with serach bar

import {useState, useRef} from 'react'

import './SearchAndSort.css'

const SearchAndSort = (prop) => {

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
            <div className='search-box'>
                <div className='input-search'>
                    <div className='box_s'>
                    <input 
                        className='search' 
                        type='text' 
                        value={searchName}
                        placeholder='Search houseworker (Enter username)'
                        onChange={selectSearchHandler}
                    />
                    <button onClick={onSearchSubmitHandler}>Search</button>
                    </div>
                </div>

                <div className='sort'>
                    <div className="sort-box">
                        <button className='sort-1' value="AgeUp" onClick={e => selectSortHandler(e.target.value)}>Age 🠑
                        </button>

                        <button className='sort-2' value="AgeDown" onClick={e => selectSortHandler(e.target.value)}>Age 🠓
                        </button>

                        <button className='sort-3' value="RatingUp" onClick={e => selectSortHandler(e.target.value)}>Rating 🠑
                        </button>

                        <button className='sort-4' value="RatingDown" onClick={e => selectSortHandler(e.target.value)}>Rating 🠓
                        </button>
                    </div>
                </div>

            </div>        
        </>
    )
} 

export default SearchAndSort