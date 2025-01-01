import FormInput from '../../../utils/FormInput';
import FormSelect from '../../../utils/FormSelect';
import Spinner from '../../../components/UI/Spinner';

import '../../../sass/pages/Register/_registerUser.scss';
import '../../../sass/pages/Register/_registerClient.scss';

const ClientForm = ({
    register,
    errors,
    cityField,
    avatarField,
    interestField,
    loading,
    city_options,
    profession_options,
    handleSubmit,
    onSubmitHandler,
    onChangeImageHandler,
    onCityChangeHandler,
    onRemoveAvatarHanlder,
    onChangeInterestHandler
    }
) =>{
    const inputs = [
        {id:'1', name:'username', type:'text', label:"Username"},
        {id:'2', name:'email' , type:'text', label:'Email' ,autoComplete:'off'}, 
        {id:'3',name:'password', type:'password', label:'Password', autoComplete:"new-password"},
        {id:'4',name:'confirmPassword', label:'Confirm Password', type:'password', autoComplete:"new-password"}, 
        {id:'5',name:'firstName' , type:'text', label:'First Name', placeholder:"Enter first name"}, 
        {id:'6',name:'lastName', type:'text', label:'Last Name', placeholder:"Enter last name"}
    ];
    
    return (
        <div className='register-user-container'>
            <form className='client-form' onSubmit={handleSubmit(onSubmitHandler)} encType="multipart/form-data">
            <div className='form-title'>Client Registration</div>
                
                <div className='form-inputs cl-form-inputs'>
                    <div className='register-box client-inputs'>
                        {inputs.map(el => {
                            return(
                            <div className='register-box-input' key={el.id}>
                                <label className='input-lab'>{el.label}</label>
                                <div className='register-input-container'>
                                    <FormInput 
                                        className='register-input'
                                        type={el.type}
                                        name={el.name}
                                        placeholder={el.placeholder}
                                        autoComplete={el.autoComplete}
                                        register={register} 
                                        errors={errors}
                                    />
                                </div>
                            </div>
                            )
                        })}  
                    </div>  
                </div>                

                <div className='cl-selectors'>
                    <div className='city-container'>
                    <FormSelect
                        placeholder="Select a city"
                        title="City"
                        options={city_options}
                        onChangeHandler={onCityChangeHandler}
                        formFieldValue={cityField.value}
                        errorsMessage={errors.city?.message}
                    />
                    </div>

                    <div className='gender-container'>
                        <label className='label-input'>Gender</label>
                        <select className="gender-option" {...register('gender')}>
                            <option value="">Choose gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <div className='input-error'>{errors.gender?.message}</div>
                    </div>

                    <div className='avatar-container'>
                        <label className='label-input'>Profile Avatar</label>
                        <div className='form-group'>
                            <input 
                                type="file" 
                                id="inputFile"
                                onChange={onChangeImageHandler}
                            />
                            <label htmlFor="inputFile" className="custom-file-button">Choose File</label>
                            <div className='avatar-place'>
                                {avatarField.value && (
                                    <div className='avatar-preview-container'>
                                        <img
                                            src={URL.createObjectURL(avatarField.value)}
                                            alt="avatar"
                                        />
                                        <button onClick={onRemoveAvatarHanlder} className='remove-avatar-btn'>
                                            Remove Image
                                        </button>
                                    </div>
                                )}
                                <div className='input-error'>{errors.avatar?.message}</div>
                            </div>
                        </div>
                    </div>

                    <div className='interest-container'>
                        <FormSelect
                            placeholder="Select the professions that interest you"
                            title="Interests"
                            options={profession_options}
                            onChangeHandler={onChangeInterestHandler}
                            formFieldValue={interestField.value}
                            errorsMessage={errors.interests?.message}
                            isMulti
                        />
                    </div>
                </div>

                <div className ='register-button-container'>
                    {loading ? (
                        <Spinner />
                    ):(
                        <button type='submit'className='btn'>Register</button>
                    )}
                </div>  
                              
            </form>
        </div>
    )
}


export default ClientForm;