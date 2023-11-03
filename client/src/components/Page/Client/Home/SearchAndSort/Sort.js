import {memo} from 'react';
import {useSelector} from 'react-redux'
import { toast } from 'react-toastify';
import '../../../../../sass/components/_sort.scss';





const Sort = (prop) =>{

    const userAuth = useSelector((state) => state.auth.user)
    const isClient = userAuth && userAuth.type === "Client";
    
    const selectSortHandler = (opt) =>{
        if(!isClient){
            toast.error("You must be logged in",{
                className:"toast-contact-message"
            })
            return 
        }
        console.log("OPTION: " + opt);
        //send selected option to parrent (searchDataHanlder(searchDataObj))
        prop.search({sort:opt}); 
    }

    return (
    <>
        <div className='sort'>
            <div className="sort-box">
                <button id='sort-1' value="AgeUp" onClick={e => selectSortHandler(e.target.value)}>Age 🠑
                </button>

                <button id='sort-2' value="AgeDown" onClick={e => selectSortHandler(e.target.value)}>Age 🠓
                </button>

                <button id='sort-3' value="RatingUp" onClick={e => selectSortHandler(e.target.value)}>Rating 🠑
                </button>

                <button id='sort-4' value="RatingDown" onClick={e => selectSortHandler(e.target.value)}>Rating 🠓
                </button>
            </div>
        </div>     
    </>
    )
}
export default memo(Sort);