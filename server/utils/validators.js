const isEmail = (email) => /\S+@\S+\.\S+/.test(email);
const isPasswordStrong = (password) => password.length >= 6;
const isTextValid = (text, min = 1, max = 200) => {
  return typeof text === 'string' && text.length >= min && text.length <= max;
};

module.exports = {
  isEmail,
  isPasswordStrong,
  isTextValid,
};