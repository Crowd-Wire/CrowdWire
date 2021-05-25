export default function  parseDate (date) {
    let tempDate = new Date(date);
    let newDate = new Date(tempDate.getTime() - tempDate.getTimezoneOffset()*60*1000);
    return newDate.toString().replace(/GMT.*/g,"");

}