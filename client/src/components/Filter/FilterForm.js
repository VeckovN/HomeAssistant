import Select from 'react-select';
import '../../sass/components/_filter.scss';

const FilterForm = ({city_options, profession_options, onChange, onChangeCity, onChangeProffesions, filterClickHanlder }) =>{
    return (
        <div className='filter-box'>

            <div className='filter-box-item'>
                <label className='filter-lb'>Professions</label>
                <div className='filter-card'>   
                    <Select 
                        className='filter-select'
                        placeholder="Select profession"
                        options={profession_options}
                        onChange={onChangeProffesions}
                        isMulti
                        isClearable
                    />
                </div>
            </div>

            <div className='filter-box-item'>
                <label className='filter-lb'>City</label>
                <div className='filter-card'>   
                    <Select 
                        className='filter-select'
                        placeholder="Select a city"
                        options={city_options}
                        onChange={onChangeCity}
                        isClearable
                    />
                </div>
            </div>

            <div className='filter-box-item'>
                <label className='filter-lb'>Gender</label>
                <div className='filter-card'>
                    <div className='filter-item'>
                        <input type="radio"  onChange={onChange} name="gender" value="Male"/>
                        <label >Male</label><br/>
                    </div>
                    <div className='filter-item'>
                        <input type="radio" onChange={onChange} name="gender" value="Female"/>
                        <label >Female</label><br/>
                    </div>
                </div>
            </div>

            <div className='filter-box-item'>
                <label className='filter-lb'>Age</label>
                <div className='filter-card'>
                    <div className='filter-item'>
                        <label>From</label>
                        <input className='age-input' type='number' onChange={onChange} name='ageFrom'/>
                    </div>
                    <div className='filter-item'>
                        <label>To</label>
                        <input className='age-input' type='number' onChange={onChange} name='ageTo'/>
                    </div>
                </div>
            </div>

            <div className='filter-card'>
                <button className ='filter-button' onClick={filterClickHanlder}>Filter</button>
            </div>

        </div>
    )
}

export default FilterForm;