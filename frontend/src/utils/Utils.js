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

export const paymentSum = (payments) => {
  let paymentSum = 0;
  const sum = payments.reduce((total, payment) => {
    return total + parseFloat(payment.amount);
  }, paymentSum);
  return sum;
};
