
const formatDate = (date) =>{
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();

    const minutes = date.getMinutes()
    const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes; 
    const formattedTime = `${date.getHours()}:${minutesFormatted}`

    return {day, month, year, time: formattedTime}
};

module.exports = formatDate;