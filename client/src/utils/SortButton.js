

const SortButton = ({value, selectSortHandler, label, id, selectedOption}) =>{
    return(
    <button 
            id={id} 
            value={value}
            onClick={e => selectSortHandler(e.target.value)}
            className={selectedOption === value ? 'selected sort' : 'sort'}
        >
            {label}
    </button>
    )
}

export default SortButton;