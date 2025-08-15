import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationDialog from '../ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <ConfirmationDialog
        isOpen={false}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
  });

  it('should render correctly when isOpen is true', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('confirmation-dialog-title')).toHaveTextContent('Confirm Action');
    expect(screen.getByTestId('confirmation-dialog-message')).toHaveTextContent(
      'Are you sure you want to proceed?'
    );
    expect(screen.getByTestId('confirmation-dialog-confirm-button')).toHaveTextContent('Confirm');
    expect(screen.getByTestId('confirmation-dialog-cancel-button')).toHaveTextContent('Cancel');
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.click(screen.getByTestId('confirmation-dialog-confirm-button'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.click(screen.getByTestId('confirmation-dialog-cancel-button'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should render custom button texts', () => {
    render(
      <ConfirmationDialog
        isOpen={true}
        title="Custom Buttons"
        message="Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        confirmText="Yes, do it!"
        cancelText="No, stop!"
      />
    );
    expect(screen.getByTestId('confirmation-dialog-confirm-button')).toHaveTextContent(
      'Yes, do it!'
    );
    expect(screen.getByTestId('confirmation-dialog-cancel-button')).toHaveTextContent('No, stop!');
  });
});
