//component with Sort Buttons (By Age and Rating)
//and in extension with serach bar

import {useEffect, useState, useRef} from 'react'

const SearchAndSort = (prop) => {

    // const [option, setOption] = useState({});

    //won't to reRender this component on input Change, only to send data to Parent(ClientHome) compoennt
    //this is reason why is useRef in use instead useState
    const valueRef = useRef();
    

    const selectSortHandler = (opt) =>{
        // setOption(opt);
        console.log("OPTION: " + opt);
        // alert(opt);
        prop.search({sort:opt}); //send selected option to parrent
        
    }

    const selectSearchHandler = ()=>{
        //return pervious value and add new search value
        // setOption(opt=> {
        //     ...opt, 
        // })
        //{name:search}
        const inputValue = valueRef.current.value;
        prop.search({name:inputValue});
    }

    return (
        <div className = 'container_search_sort'>
            <div class='sort_container'>
                <div class="sort-box">
                    {/* <button class='sort-1' value="AgeUp" onClick={e => setOption(e.target.value)} />Godine 🠑 */}                    
                    <button class='sort-2' value="AgeUp" onClick={e => selectSortHandler(e.target.value)}>Godine 🠑
                    </button>
                    <button class='sort-2' value="AgeDown" onClick={e => selectSortHandler(e.target.value)}>Godine 🠓
                    </button>
                    <button class='sort-3' value="RatingUp" onClick={e => selectSortHandler(e.target.value)}>Ocena 🠑
                    </button>
                    <button class='sort-4' value="RatingDown" onClick={e => selectSortHandler(e.target.value)}>Ocena 🠓
                    </button>
                </div>
            </div>

            <div className='search_container'>
                <div class='box'>
                    <input 
                        class='search' 
                        type='text' 
                        ref={valueRef}
                        placeholder='Pretrazi kucnog pomocnika'
                        onChange={selectSearchHandler}
                    />
                    <button class='search-button'>
                        {/* <i class='fa fa-search'></i> */}
                        <div>icon</div>
                    </button>
                </div>

            </div>
        </div>
    )
} 

export default SearchAndSort