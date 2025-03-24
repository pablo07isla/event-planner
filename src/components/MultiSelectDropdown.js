import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { ChevronDown, X, Check } from "lucide-react";
import { useTranslation } from 'react-i18next';

function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder,
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleOptionClick = (value) => {
    const updatedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(updatedValues);
  };

  const handleRemoveOption = (event, value) => {
    event.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {selectedValues.length > 0 ? (
              selectedValues.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-primary-600 focus:border-primary-600  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                >
                  {value}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(e, value)}
                    className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                  >
                    <span className="sr-only">{t('multiSelect.removeOption')}</span>
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400">{placeholder || t('multiSelect.placeholder')}</span>
            )}
          </div>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-300">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => handleOptionClick(option.value)}
                className="form-checkbox h-5 w-5 text-gray-900 text-sm transition duration-150 ease-in-out "
              />
              <span className="ml-2 text-gray-700">{option.label}</span>
              {selectedValues.includes(option.value) && (
                <Check className="ml-auto h-5 w-5 text-indigo-600" />
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

MultiSelectDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedValues: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

MultiSelectDropdown.defaultProps = {
  placeholder: undefined,
};

export default MultiSelectDropdown;
