import { forwardRef, type ComponentProps } from 'react';

type SelectOption = {
    value: string;
    label: string;
};

type SelectProps = ComponentProps<'select'> & {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`
            w-full px-3 py-2 rounded-lg border bg-white
            text-slate-900
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300'}
            ${className}
          `}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
