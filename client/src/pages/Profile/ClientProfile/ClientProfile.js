import ClientProfileForm from './ClientProfileForm.js';
import {getUserData, updateClient} from '../../../services/client.js';
import useProfileUpdate from '../../../hooks/useProfileUpdate.js';

const ClientProfile = () =>{ 
    const initialState = {
        email:'',
        password:'',
        confirmRepeat:'',
        first_name:'',
        last_name:'',
        avatar:null,
        city:'',
    }

    const {
        register,
        handleSubmit,
        watch,
        errors,
        cityField,
        avatarField,
        userData: clientData,
        loading,
        onSubmitUpdate,
        onCityChangeHandler,
        onChangeAvatarHandler,
        onRemoveAvatarHandler
    } = useProfileUpdate({
        initialState,
        fetchUserData: getUserData,
        updateUserData:updateClient
    })

    return(
        <ClientProfileForm 
            loading={loading}
            clientData={clientData}
            cityField={cityField}
            avatarField={avatarField}
            errors={errors}
            register={register}
            watch={watch} 
            handleSubmit={handleSubmit}
            onSubmitUpdate={onSubmitUpdate}
            onCityChangeHandler={onCityChangeHandler}
            onChangeAvatarHandler={onChangeAvatarHandler}
            onRemoveAvatarHandler={onRemoveAvatarHandler}
        />
    )
}

export default ClientProfile;