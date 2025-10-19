import {loadDefaultImageOnError} from '../utils/Helper';
import '../sass/components/_profileAvatar.scss';

const ProfileAvatar = ({avatarField, userData, errors, onChangeAvatarHandler,  onRemoveAvatarHandler}) =>{
    return(
        <div className='profile-avatar-container'>
            <label className='label-input'>Profile Avatar</label>
            <div className='form-group'>
                <input 
                    type="file" 
                    id="inputFile"
                    onChange={onChangeAvatarHandler}
                />
                <label htmlFor="inputFile" className="custom-file-button">Choose File</label>
                <div className='avatar-place'>
                    {(avatarField.value || userData.picturePath) && (
                        <div className='avatar-preview-container'>
                            {avatarField.value ? (
                            <>
                                <img
                                    //display Choosen Avatar Form
                                    src={URL.createObjectURL(avatarField.value)}
                                    alt="avatar"
                                />
                                <button onClick={onRemoveAvatarHandler} className='remove-avatar-btn'>
                                    Remove Image
                                </button>
                            </>
                            ) 
                            : userData.avatar ? (
                                <img
                                    src={URL.createObjectURL(userData.avatar)} 
                                    alt="avatar"
                                />
                            ) : (
                                <img
                                    src={userData.picturePath}
                                    onError={loadDefaultImageOnError}
                                    alt="avatar"
                                />
                            )   
                        } 
                        </div>
                    )}
                </div>

                <div className='input-error'>{errors.avatar?.message}</div>
            </div>
        </div>
    )
}

export default ProfileAvatar;