import React from 'react';
import { normalizeInput, isValidNumber } from '../utils/currency';

interface CurrencyInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = "",
  className = "input-field",
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    const allowedPattern = /^[0-9,.]*$/;
    
    if (allowedPattern.test(inputValue) || inputValue === '') {
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    if (value && isValidNumber(value)) {
      const normalized = normalizeInput(value);
      onChange(normalized);
    }
  };

  return (
    <input
      type="text"
      id={id}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      required={required}
      inputMode="decimal"
      pattern="[0-9,.*"
    />
  );
};

export default CurrencyInput;