import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('should render with default primary variant', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gray-700'); // Default primary variant style
    expect(button).toHaveAttribute('data-testid', 'button-primary');
  });

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-gray-100');
    expect(button).toHaveAttribute('data-testid', 'button-secondary');
  });

  it('should render with danger variant', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-red-700');
    expect(button).toHaveAttribute('data-testid', 'button-danger');
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Test Click</Button>);
    const button = screen.getByRole('button', { name: /test click/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should pass through additional props', () => {
    render(
      <Button type="submit" disabled>
        Submit
      </Button>
    );
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
  });
});
