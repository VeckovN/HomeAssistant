const FormInput = ({type, name, register, errors, placeholder}) =>{    
    return(
        <>
            <input
                className='input_field'
                type={type}
                placeholder={placeholder || `Enter ${name}`}
                {...register(name)}
            />
            {/* <div className='input_errors'>{errors.errorsname?.message}</div> */}
            <div className='input_errors'>{errors[name]?.message}</div>
        </>
    )
}

export default FormInput;