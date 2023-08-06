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

            {/* Component for multiple option select */}

            {/* GRAD */}
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

            {/* GENDER */}
            <label class='filter-lb'>Gender:</label>
            <div class='filter-card'>
                <div class='filter-item'>
                    <input type="radio"  onChange={onChange} name="gender" value="Male"/>
                    <label >Male</label><br/>
                    <input type="radio" onChange={onChange} name="gender" value="Female"/>
                    <label >Female</label><br/>
                </div>
            </div>

            {/* AGE */}
            <label class='filter-lb'>Age:</label>
            <div class='filter-card'>
                <div class='filter-item'>
                    <label>From</label>
                    <input class='sl' type='number' onChange={onChange} name='ageFrom'/>
                </div>
                <div class='filter-item'>
                    <label>To</label>
                    <input class='sl' type='number' onChange={onChange} name='ageTo'/>
                </div>
            </div>

            <div class='filter-card'>
                <button class ='filter-button' onClick={filterClickHanlder}>Filter</button>
            </div>

        </div>
    )
}

export default FilterForm;