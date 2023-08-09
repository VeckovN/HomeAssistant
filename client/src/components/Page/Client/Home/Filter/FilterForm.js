import Select from 'react-select';


const FilterForm = ({city_options, profession_options, onChange, onChangeCity, onChangeProffesions, filterClickHanlder }) =>{

    return (
        <div className='filterBox'>

            <div className='select-filter-box'>
                <Select 
                    className='dropdown'
                    placeholder="Select profession"
                    options={profession_options}
                    onChange={onChangeProffesions}
                    isMulti
                    isClearable
                />
            </div>

            <label className='filter-lb'>City:</label>
            <div className='filter-card'>   
                <Select 
                    className='dropdown'
                    placeholder="Select a city"
                    options={city_options}
                    onChange={onChangeCity}
                    isClearable
                />
            </div>

            <label className='filter-lb'>Gender:</label>
            <div className='filter-card'>
                <div className='filter-item'>
                    <input type="radio"  onChange={onChange} name="gender" value="Male"/>
                    <label >Male</label><br/>
                    <input type="radio" onChange={onChange} name="gender" value="Female"/>
                    <label >Female</label><br/>
                </div>
            </div>

            <label className='filter-lb'>Age:</label>
            <div className='filter-card'>
                <div className='filter-item'>
                    <label>From</label>
                    <input className='sl' type='number' onChange={onChange} name='ageFrom'/>
                </div>
                <div className='filter-item'>
                    <label>To</label>
                    <input className='sl' type='number' onChange={onChange} name='ageTo'/>
                </div>
            </div>

            <div className='filter-card'>
                <button className ='filter-button' onClick={filterClickHanlder}>Filter</button>
            </div>

        </div>
    )
}

export default FilterForm;