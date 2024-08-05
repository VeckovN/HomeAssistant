import { useState, memo } from "react";

import '../sass/components/_search.scss';

const Search = (prop) =>{
    const [searchName, setSearchName] = useState('');

    const selectSearchHandler = (e)=>{
        setSearchName(e.target.value);
    }

    const onSearchSubmitHandler = () =>{
        prop.search({name:searchName});
    }
    
    const onEnterPressSubmitHanlder = (e) =>{
        if(e.key == "Enter"){
            e.preventDefault();
            prop.search({name:searchName});
        }
    }
    return (
    <>
        <div className='input-search'>
            <div className='box-s'>
                <input 
                    className='search' 
                    type='text' 
                    value={searchName}
                    placeholder='Search houseworker (Enter username)'
                    onChange={selectSearchHandler}
                    onKeyDown={onEnterPressSubmitHanlder}
                />
                <button onClick={onSearchSubmitHandler}>Search</button>
            </div>
        </div>
    </>
    )
}

export default memo(Search)
