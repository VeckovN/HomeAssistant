import { city_options } from '../../utils/options';
import HouseworkerProfessions from '../../components/HouseworkerProfessions.js';
import HouseworkerInputs from '../../components/HouseworkerInputs.js';
import Spinner from '../../components/UI/Spinner.js';
import '../../sass/pages/_houseworkerProfile.scss';

const HouseworkerProfileForm = ({loading, houseworkerData, setHouseworkerData, cityField, avatarField, register, errors, watch, handleSubmit, getNotOwnedProfessions, onSubmitUpdate, onChangeCityHandler, onChangeAvatarHandler, onRemoveAvatarHandler}) =>{
    return(
        <div className='hs-profile-container'>
                {loading ? <Spinner className={'profile-spinner'}/> :
                <>
                    <form className='hs-profile-form' onSubmit={handleSubmit(onSubmitUpdate)}>
                        <section className ='professions'>
                            <div className='section-label'>Professions</div>
                            <HouseworkerProfessions
                                houseworkerData={houseworkerData}
                                setHouseworkerData={setHouseworkerData}
                                getNotOwnedProfessions={getNotOwnedProfessions}
                            />
                        </section>
                        <section className='input-form'>
                            <div className='section-label'>Personal Info</div>
                            <HouseworkerInputs
                                houseworkerData={houseworkerData}
                                register={register}
                                errors={errors}
                                watch={watch}
                                cityField={cityField}
                                avatarField={avatarField}
                                city_options={city_options}
                                onChangeCityHandler={onChangeCityHandler}
                                onChangeAvatarHandler={onChangeAvatarHandler}
                                onRemoveAvatarHandler={onRemoveAvatarHandler}
                            />
                            <br></br>

                            <div className='profile-submit'>
                                <button type='submit' className='update-button'>Update</button>
                            </div>
                        </section>

                    </form>
                </>
                }
            </div>
    )

}

export default HouseworkerProfileForm;