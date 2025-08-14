import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
  it('should render input with a label', () => {
    render(<Input id="test-input" label="Test Label" />);
    const labelElement = screen.getByText(/test label/i);
    const inputElement = screen.getByRole('textbox', { name: /test label/i });

    expect(labelElement).toBeInTheDocument();
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('id', 'test-input');
    expect(labelElement).toHaveAttribute('for', 'test-input');
    expect(inputElement).toHaveAttribute('data-testid', 'input-test-input');
  });

  it('should render input without a label', () => {
    render(<Input id="no-label-input" />);
    const inputElement = screen.getByRole('textbox', { name: '' });

    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('id', 'no-label-input');
    expect(screen.queryByLabelText(/no label/i)).not.toBeInTheDocument();
    expect(inputElement).toHaveAttribute('data-testid', 'input-no-label-input');
  });

  it('should call onChange handler when input value changes', () => {
    const handleChange = jest.fn();
    render(<Input id="change-input" onChange={handleChange} />);
    const inputElement = screen.getByTestId('input-change-input');

    fireEvent.change(inputElement, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(inputElement).toHaveValue('new value');
  });

  it('should pass through additional props', () => {
    render(<Input id="placeholder-input" placeholder="Enter text" type="password" />);
    const inputElement = screen.getByTestId('input-placeholder-input');

    expect(inputElement).toHaveAttribute('placeholder', 'Enter text');
    expect(inputElement).toHaveAttribute('type', 'password');
  });
});
