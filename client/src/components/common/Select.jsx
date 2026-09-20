/**
 * @file Select.jsx
 * @description Standardized high-contrast dropdown selection input.
 */

import React from 'react';

export default function Select({
  label,
  options = [],
  required = false,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-bold tracking-wider uppercase text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <select
        required={required}
        className={`w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer ${
          error ? 'border-rose-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-white bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}