import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-700 hover:border-gray-600'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
};
