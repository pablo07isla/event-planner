import { useState } from 'react';

const useModalForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleMoneyChange = (e, formatCurrency) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) {
      setFormData(prevState => ({
        ...prevState,
        [name]: ""
      }));
      return;
    }
    setFormData(prevState => ({
      ...prevState,
      [name]: numericValue
    }));
    e.target.value = formatCurrency(numericValue);
  };

  return { formData, setFormData, handleChange, handleMoneyChange };
};

export default useModalForm; 