//component with Sort Buttons (By Age and Rating)
//and in extension with serach bar

import {useEffect, useState, useRef} from 'react'

import './SearchAndSort.css'

const SearchAndSort = (prop) => {

    // const [option, setOption] = useState({});

    //won't to reRender this component on input Change, only to send data to Parent(ClientHome) compoennt
    //this is reason why is useRef in use instead useState
    const valueRef = useRef();
    const [searchName, setSearchName] = useState();
    

    const selectSortHandler = (opt) =>{
        // setOption(opt);
        console.log("OPTION: " + opt);
        // alert(opt);
        prop.search({sort:opt}); //send selected option to parrent
        
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



        // <div className = 'container_search_sort'>
        //     <div class='sort_container'>
        //         <div class="sort-box">
        //             {/* <button class='sort-1' value="AgeUp" onClick={e => setOption(e.target.value)} />Godine 🠑 */}                    
        //             <button class='sort-2' value="AgeUp" onClick={e => selectSortHandler(e.target.value)}>Godine 🠑
        //             </button>
        //             <button class='sort-2' value="AgeDown" onClick={e => selectSortHandler(e.target.value)}>Godine 🠓
        //             </button>
        //             <button class='sort-3' value="RatingUp" onClick={e => selectSortHandler(e.target.value)}>Ocena 🠑
        //             </button>
        //             <button class='sort-4' value="RatingDown" onClick={e => selectSortHandler(e.target.value)}>Ocena 🠓
        //             </button>
        //         </div>
        //     </div>

        //     <div className='search_container'>
        //         <div class='box'>
        //             <input 
        //                 class='search' 
        //                 type='text' 
        //                 ref={valueRef}
        //                 placeholder='Pretrazi kucnog pomocnika'
        //                 onChange={selectSearchHandler}
        //             />
        //         </div>
        //     </div>
        // </div>




    )
} 

export default SearchAndSort