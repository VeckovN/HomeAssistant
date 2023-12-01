import ClockLoader from 'react-spinners/ClockLoader'

const override = {
    display: "block",
    margin : "0 auto",
}
const Spinner = ({className}) =>{
    return (
        <div className={className}>
        {/* <div className='spinner'> */}
            <ClockLoader
                color="rgba(180, 240, 250, 1)"
                cssOverride={override}
            />
                
        </div>
    )
}

export default Spinner;