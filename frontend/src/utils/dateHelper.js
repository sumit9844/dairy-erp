import NepaliDate from 'nepali-date-converter';

export const formatBS = (adDateString) => {
    if (!adDateString) return "";
    try {
        const adDate = new Date(adDateString);
        const bsDate = new NepaliDate(adDate);
        // Format: 2081-10-22
        return bsDate.format('YYYY-MM-DD'); 
    } catch (e) {
        return "Invalid Date";
    }
};

export const getTodayBS = () => {
    return new NepaliDate().format('YYYY-MM-DD');
};