/**
 * @desc Checks for valid email
 * @param {String} value // Accepts string
 */

 export const isEmail = (value: string) => {
    const email = value;
    const myRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isValid = myRegEx.test(email);
    if (isValid) {
      return true;
    } else {
      return false;
    }
  };