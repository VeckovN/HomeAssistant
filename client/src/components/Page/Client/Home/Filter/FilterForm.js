

const FilterForm = () =>{

    return (
        <div className='filterBox'>

            <div className='select-filter-box'>
                <Select 
                    className='dropdown'
                    placeholder="Select profession"
                    //Value for each option (in options object take key:Value )
                    // value={options.filter(obj => )}
                    options={options}
                    onChange={onProfessionSelect}
                    isMulti
                    isClearable
                />
            </div>

            {/* GRAD */}
            <label className='filter-lb'>City:</label>
            <div className='filter-card'>   
                <Select 
                    className='dropdown'
                    placeholder="Select a city"
                    //Value for each option (in options object take key:Value )
                    // value={options.filter(obj => )}
                    options={city_options}
                    onChange={onCitySelect}
                    isClearable
                />
            </div>

            {/* GENDER */}
            <label class='filter-lb'>Gender:</label>
            <div class='filter-card'>
                <div class='filter-item'>
                    <input type="radio"  onChange={onChangeHandler} name="gender" value="Male"/>
                    <label >Male</label><br/>
                    <input type="radio" onChange={onChangeHandler} name="gender" value="Female"/>
                    <label >Female</label><br/>
                </div>
            </div>

            {/* AGE */}
            <label class='filter-lb'>Age:</label>
            <div class='filter-card'>

                <div class='filter-item'>
                    <label>From</label>
                    <input class='sl' type='number' onChange={onChangeHandler} name='ageFrom'/>
                </div>

                <div class='filter-item'>
                    <label>To</label>
                    <input class='sl' type='number' onChange={onChangeHandler} name='ageTo'/>
                </div>
        
            </div>


            <div class='filter-card'>
                <button class ='filter-button' onClick={filterClickHanlder}>Filter</button>
            </div>

        </div>
    )
}

export default FilterForm;