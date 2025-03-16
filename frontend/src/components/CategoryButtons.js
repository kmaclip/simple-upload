// src/components/CategoryButtons.js
import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const Button = styled.button`
  padding: 10px 20px;
  margin: 5px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  background-color: ${props => props.selected ? props.theme.primary : props.theme.secondary};
  color: ${props => props.theme.buttonText};
  border-radius: 5px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const ButtonContainer = styled.div`
  background-color: ${props => props.theme.surface};
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
`;

const CategoryButtons = ({ onSelectCategory, selectedCategory }) => {
  const { theme } = useTheme();

  return (
    <ButtonContainer theme={theme}>
      <Button 
        onClick={() => onSelectCategory('Inventory')}
        selected={selectedCategory === 'Inventory'}
        theme={theme}
      >
        Inventory
      </Button>
      <Button 
        onClick={() => onSelectCategory('Shipments')}
        selected={selectedCategory === 'Shipments'}
        theme={theme}
      >
        Shipments
      </Button>
    </ButtonContainer>
  );
};

export default CategoryButtons;
