import moment from 'moment';

export const isUserLoggedIn = () => localStorage.getItem('userData');
export const getUserData = () => {
  return localStorage.getItem('userData');
};

export const isObjEmpty = (obj) => Object.keys(obj).length === 0;

export const getToken = () => {
  return localStorage.getItem('accessToken');
};

export const removeToken = () => {
  localStorage.removeItem('accessToken');
};
export const setToken = (val) => {
  localStorage.setItem('accessToken', val);
};

export const removeUserData = () => {
  localStorage.removeItem('userData');
};
export const setUserData = (val) => {
  localStorage.setItem('userData', val);
};

export const setFilterData = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const removeFilterData = (key) => {
  localStorage.removeItem(key);
};

export const getFilterData = (key) => {
  return localStorage.getItem(key);
};

export const getDateFormat = (formattedDate) => {
  const formattedDateMoment = moment(`${formattedDate}`, 'YYYY-MM-DD HH:mm A');
  const formattedDateTime = moment(formattedDateMoment).format('llll');
  return formattedDateTime;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const standardFormatDate = (dateString) => {
  return moment(dateString).format('MMM DD, YYYY');
};

export const paymentSum = (payments) => {
  let paymentSum = 0;
  const sum = payments.reduce((total, payment) => {
    return total + parseFloat(payment.amount);
  }, paymentSum);
  return sum;
};

export const checkFavourite = (favourite, user) => {
  const checkFavouriteValue = favourite?.includes(user);
  return checkFavouriteValue;
};

export const calendarFormateDate = (dateString, timeString) => {
  const parsedTime = moment(timeString, 'h:mm A');

  // Extract hour and minute
  const hour = parsedTime.hour();
  const minute = parsedTime.minute();
  const initialMoment = moment(dateString);

  const finalMoment = initialMoment.clone().add({ hours: hour, minutes: minute });
  return finalMoment.format();
};

export const selectThemeColors = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: '#7367f01a', // for option hover bg-color
    primary: '#7367f0', // for selected option bg-color
    neutral10: '#7367f0', // for tags bg-color
    neutral20: '#ededed', // for input border-color
    neutral30: '#ededed' // for input hover border-color
  }
});

export const getHourDifference = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffInMilliseconds = Math.abs(endDate - startDate);
  const hoursDifference = diffInMilliseconds / (1000 * 60 * 60);

  return hoursDifference;
};
