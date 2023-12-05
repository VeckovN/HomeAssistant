
import SouthIcon from '@mui/icons-material/South';
import NorthIcon from '@mui/icons-material/North';

const SortButton = ({value, selectSortHandler, label, id, selectedOption}) =>{
    
    const upIcon = (value === 'AgeUp' || value === 'RatingUp') ? <NorthIcon fontSize='inherit'/> : null
    const downIcon = (value === 'AgeDown' || value === 'RatingDown') ? <SouthIcon fontSize='inherit'/> : null

    return(
    <button 
            id={id} 
            value={value}
            onClick={e => selectSortHandler(e.target.value)}
            className={selectedOption === value ? 'selected sort' : 'sort'}
        >
            {label} {upIcon || downIcon}
    </button>
    )
}

export default SortButton;