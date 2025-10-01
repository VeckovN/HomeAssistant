import {handlerError} from '../../../utils/ErrorUtils.js';
import HouseworkerProfileForm from './HouseworkerProfileForm';
import {profession_options} from '../../../utils/options';
import {getUserData, getProfessions, updateHouseworker} from '../../../services/houseworker.js';
import useProfileUpdate from '../../../hooks/useProfileUpdate.js';

const HouseworkerProfile = () =>{
    const initialState = {
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        city:'',
        address:'',
        phone_number:'',
        description:''
    }

    const getNotOwnedProfessions = (houseworker_professions) =>{
        const profession_format = houseworker_professions?.map(el =>({value: el.profession, label: el.profession + " " + el.working_hour +'€'}))
        const professions = profession_options.filter((option) =>{
            return !profession_format.some((mine) => mine.value === option.value)
        })
        return {professions, profession_format};
    }

    const fetchHouseworkerData = async() =>{
        try{
            const houseworkerResult = await getUserData();
            const houseworker_professions = await getProfessions(); //from users

            const {professions:not_owned_professions, profession_format } = getNotOwnedProfessions(houseworker_professions);
            const newHouseworker = {...houseworkerResult, professions:[...profession_format], not_owned_professions:[...not_owned_professions]}

            return newHouseworker;
        }
        catch(err){
            handlerError(err);
        }
    }

    const {
        register,
        handleSubmit,
        watch,
        errors,
        cityField,
        avatarField,
        userData: houseworkerData,
        setUserData: setHouseworkerData,
        loading,
        onSubmitUpdate,
        onCityChangeHandler,
        onChangeAvatarHandler,
        onRemoveAvatarHandler,
    } = useProfileUpdate({
        initialState,
        fetchUserData: fetchHouseworkerData,
        updateUserData: updateHouseworker
    })


    return(
        <HouseworkerProfileForm 
            loading={loading}
            register={register}
            errors={errors}
            watch={watch}
            cityField={cityField}
            avatarField={avatarField}
            onChangeCityHandler={onCityChangeHandler}
            onChangeAvatarHandler={onChangeAvatarHandler}
            onRemoveAvatarHandler={onRemoveAvatarHandler}
            handleSubmit={handleSubmit}
            onSubmitUpdate={onSubmitUpdate}
            houseworkerData={houseworkerData}
            setHouseworkerData={setHouseworkerData}
            getNotOwnedProfessions={getNotOwnedProfessions}
        />
    )
} 

export default HouseworkerProfile;