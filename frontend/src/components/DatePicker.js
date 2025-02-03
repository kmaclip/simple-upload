import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styled from 'styled-components';
import { useTheme } from '../ThemeContext';

const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: auto;
  }

  .react-datepicker {
    background-color: ${props => props.theme.surface};
    border-color: ${props => props.theme.border};
  }

  .react-datepicker__header {
    background-color: ${props => props.theme.surface};
    border-color: ${props => props.theme.border};
  }

  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker__day {
    color: ${props => props.theme.text};
  }

  .react-datepicker__day:hover {
    background-color: ${props => props.theme.primary};
    color: ${props => props.theme.buttonText};
  }

  .react-datepicker__day--selected {
    background-color: ${props => props.theme.primary};
    color: ${props => props.theme.buttonText};
  }
`;

const StyledDatePicker = styled(DatePicker)`
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid ${props => props.theme.border};
  background-color: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }
`;

const DatePickerComponent = ({ selectedDate, onChange }) => {
  const { theme } = useTheme();

  return (
    <DatePickerWrapper theme={theme}>
      <StyledDatePicker
        selected={selectedDate}
        onChange={onChange}
        dateFormat="MMMM d, yyyy"
        theme={theme}
      />
    </DatePickerWrapper>
  );
};

export default DatePickerComponent;