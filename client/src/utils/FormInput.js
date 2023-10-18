const FormInput = ({type, name, register, errors, placeholder, autoComplete}) =>{    
    return(
        <>
            <input
                className='input_field'
                type={type}
                placeholder={placeholder || `Enter ${name}`}
                {...register(name)}
                autoComplete={autoComplete && autoComplete}
            />
            {/* <div className='input_errors'>{errors.errorsname?.message}</div> */}
            <div className='input_errors'>{errors[name]?.message}</div>
        </>
    )
}

export default FormInput;