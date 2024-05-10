/**
 ** Return if user is logged in
 ** This is completely up to you and how you want to store the token in your frontend application
 *  ? e.g. If you are using cookies to store the application please update this function
 */
export const isUserLoggedIn = () => localStorage.getItem('userData');
export const getUserData = () => JSON.parse(localStorage.getItem('userData'));

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
