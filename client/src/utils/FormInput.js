import '../sass/components/_formInput.scss';

const FormInput = ({type, name, register, errors, placeholder, autoComplete, className}) =>{    
    const additionalClassName = className ? `input-field ${className} ` : 'input-field';
    const inputClassName = errors[name] ? `input-error-line ${additionalClassName} ` : `${additionalClassName}`;

    return(
        <div className='form-input'>
            <input
                className={inputClassName}
                type={type}
                placeholder={placeholder || `Enter ${name}`}
                {...register(name)}
                autoComplete={autoComplete && autoComplete}
            />
            <div className='input-errors'>{errors[name]?.message}</div>
        </div>
    )
}

export default FormInput;