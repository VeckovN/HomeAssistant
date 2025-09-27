import PuffLoader from 'react-spinners/PuffLoader'

const override = {
    display: "block",
    margin : "0 auto",
}
const Spinner = ({className, color = 'rgba(120, 240, 250, 1)'}) =>{
    return (
        <div className={className}>
            <PuffLoader
                color={color}
                cssOverride={override}
                speedMultiplier={2}
            /> 
        </div>
    )
}

export default Spinner;