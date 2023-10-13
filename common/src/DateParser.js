const format = require('fecha').format;





const setGlobalDateI18n=({
  dayNamesShort: ['Hola', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
  dayNames: ['Ho', 'holaa', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  monthNamesShort: ['Jahola', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  monthNames: ['hola', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'holaaaa', 'November', 'December'],
  amPm: ['am', 'pm'],
  // D is the day of the month, function returns something like...  3rd or 11th
  DoFn: function (D) {
    return D + [ 'hola  ', 'hola', 'hola', 'hola' ][ D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10 ];
  }
});


/*
* Parsea un Date de un string formato YYYY-MM-dd sin timezones
*/
const parseDBDate = fecha => {
  // ISO6801 string
  if (fecha.includes('T') && fecha.endsWith('Z')) return new Date(fecha);

  //fucking timezones http://stackoverflow.com/a/31732581
  return new Date(fecha.replace(/-/g, '/'));
 
};

const toReadableDate = fecha => {
  return format(fecha, 'YYYY-MM-DD',setGlobalDateI18n);
};

const toReadableDateTime = fecha => {
  return format(fecha, 'YYYY-MM-DD HH:mm',setGlobalDateI18n);
};

const toDatilDate = fecha => {
  return fecha.toISOString();
};

const oneYearFromToday = () => {
  return new Date(new Date().setFullYear(new Date().getFullYear() + 1));
};

module.exports = {
  oneYearFromToday,
  parseDBDate,
  toReadableDate,
  toReadableDateTime,
  toDatilDate
};
