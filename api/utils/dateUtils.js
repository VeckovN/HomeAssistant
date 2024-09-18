
const formatDate = (date) =>{
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();

    const minutes = date.getMinutes()
    const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes; 
    const formattedTime = `${date.getHours()}:${minutesFormatted}`

    return {day, month, year, time: formattedTime}
};

const parseFormattedDate = (formattedDate) =>{
    const {day, month, year, time} = formattedDate;
    const [hours, minutes] = time.split(":").map(Number);
    //"Hour:Minutes(09 isnstead of 9)"
    const minutesF = parseInt(minutes, 10);
    
    return new Date(year, month -1 , day, hours, minutes);
}


const calculateTimeDifference = (formattedDate) =>{
    const now = new Date();
    const date = parseFormattedDate(formattedDate);

    const diffInMs = now - date;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    // const diffInMonths = Math.floor(diffInDays / 30); // Rough estimate of months
    // const diffInYears = Math.floor(diffInDays / 365); // Rough estimate of years
    const diffInYears = now.getFullYear() - date.getFullYear();
    const diffInMonths = now.getMonth() - date.getMonth() + (diffInYears * 12);

    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours`;
    } else if (diffInDays < 7) {
        return `${diffInDays} days`;
    } else if (diffInWeeks < 4) {
        return `${diffInWeeks} weeks`;
    } else if (diffInMonths < 12) {
        return `${diffInMonths} months`;
    } else {
        return `${diffInYears} years`;
    }
}

module.exports = {
    formatDate,
    parseFormattedDate,
    calculateTimeDifference
}
