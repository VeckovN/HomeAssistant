import Select from 'react-select';
import '../sass/components/_formSelect.scss';

const FormSelect = ({options, onChangeHandler, title, formFieldValue, placeholder, errorsMessage, isMulti}) =>{
    return (
    <div className='form-select'>    
        <label className='label-input'>{title}</label>
        <div className='select-box'>
            <Select 
                className='dropdown'
                placeholder={placeholder}
                options={options}
                value={options.find(({value}) => value === formFieldValue)}
                onChange={onChangeHandler}
                isClearable
                isMulti={isMulti}
            />
        </div>
        <div className='input-error'>{errorsMessage}</div>
    </div>
    )
}

export default FormSelect;

{/* 
<div className='form-select'>
    <label className='label_input'>Professions</label>
    <Select 
        className='dropdown'
        placeholder="Select the Profession"
        options={profession_options}
        value={profession_options.find(({value}) => value === professionField.value)}
        onChange={onChangeProffesionsHandler}
        isMulti
        isClearable
    />
    <div className='input-error'>{errors.professions?.message}</div>
</div>
*/}


