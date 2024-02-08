import {memo, useState} from 'react';
import {useSelector} from 'react-redux'
import { toast } from 'react-toastify';
import SortButton from '../utils/SortButton.js'

import '../sass/components/_sort.scss';

const Sort = (prop) =>{

    const userAuth = useSelector((state) => state.auth.user)
    const isClient = userAuth && userAuth.type === "Client";

    const [selectedOption, setSelectedOption] = useState('');
    
    const selectSortHandler = (opt) =>{
        if(!isClient){
            toast.error("You must be logged in",{
                className:"toast-contact-message"
            })
            return 
        }
        console.log("OPTION: " + opt);
        console.log("SELECTED: " + selectedOption);

        //toggle effect
        if(selectedOption === opt)
            setSelectedOption('')
        else
            setSelectedOption(opt);
    
        //send selected option to parrent (searchDataHanlder(searchDataObj))
        prop.search({sort:opt}); 
    }

    return (
    <>
        <div className='sort'>
            <div className="sort-box">
                <SortButton
                    label="Age"
                    value="AgeUp" 
                    selectSortHandler={selectSortHandler}
                    selectedOption={selectedOption}
                />

                <SortButton
                    id='sort-2' 
                    label="Age"
                    value="AgeDown" 
                    selectSortHandler={selectSortHandler}
                    selectedOption={selectedOption}
                />

                <SortButton
                    label="Rating"
                    value="RatingUp" 
                    selectSortHandler={selectSortHandler}
                    selectedOption={selectedOption}
                />

                <SortButton
                    label="Rating"
                    value="RatingDown" 
                    selectSortHandler={selectSortHandler}
                    selectedOption={selectedOption}
                />

                {/* <button 
                    // id='sort-4' 
                    value="RatingDown" 
                    onClick={e => selectSortHandler(e.target.value)}
                    className={selectedOption === 'RatingDown' ? 'selected sort' : 'sort'}
                >
                    Rating 🠓
                </button> */}
            </div>
        </div>     
    </>
    )
}
export default memo(Sort);