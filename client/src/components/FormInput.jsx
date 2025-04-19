import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  validation,
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    if (validation && isTouched) {
      const { isValid: valid, message } = validation(value);
      setIsValid(valid);
      setValidationMessage(message);
    }
  }, [value, isTouched, validation]);

  const handleBlur = () => {
    setIsTouched(true);
  };

  const showError = error || (isTouched && !isValid);

  return (
    <div className={`mb-5 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full rounded-md shadow-sm ${
            showError
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } sm:text-sm py-2 px-3 ${disabled ? 'bg-gray-50' : ''}`}
        />
        {showError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {showError && (
        <p className="mt-1 text-sm text-red-600">
          {error || validationMessage}
        </p>
      )}
    </div>
  );
};

export default FormInput;