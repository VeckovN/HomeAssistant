import '../sass/components/_formInput.scss';

const FormInput = ({type, name, register, errors, placeholder, autoComplete}) =>{    
    return(
        <div className='form-input'>
            <input
                className='input-field'
                type={type}
                placeholder={placeholder || `Enter ${name}`}
                {...register(name)}
                autoComplete={autoComplete && autoComplete}
            />
            {/* <div className='input_errors'>{errors.errorsname?.message}</div> */}
            <div className='input-errors'>{errors[name]?.message}</div>
        </div>
    )
}

export default FormInput;