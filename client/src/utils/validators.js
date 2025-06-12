export const isEmail = (email) => /\S+@\S+\.\S+/.test(email);
export const isPasswordStrong = (password) => password.length >= 6;
export const isTextValid = (text, min = 1, max = 200) =>
  typeof text === 'string' && text.length >= min && text.length <= max;
