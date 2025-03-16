// src/components/DatePicker.js
import React from 'react';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import 'react-datepicker/dist/react-datepicker.css';
import { useTheme } from '../contexts/ThemeContext';

const StyledDatePicker = styled(DatePicker)`
  padding: 10px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 5px;
  font-size: 16px;
  color: ${props => props.theme.text};
  background-color: ${props => props.theme.surface};
`;

const DatePickerComponent = ({ selectedDate, onChange }) => {
  const { theme } = useTheme();

  return (
    <StyledDatePicker
      selected={selectedDate}
      onChange={onChange}
      theme={theme}
      dateFormat="yyyy-MM-dd"
    />
  );
};

export default DatePickerComponent;
