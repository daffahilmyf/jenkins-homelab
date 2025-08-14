import React from 'react';
import { motion } from 'framer-motion'; // Import motion
import Button from '@/components/atoms/Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      data-testid="confirmation-dialog"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50"
    >
      <div data-testid="confirmation-dialog-content" className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
        <h3 data-testid="confirmation-dialog-title" className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p data-testid="confirmation-dialog-message" className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button data-testid="confirmation-dialog-cancel-button" variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button data-testid="confirmation-dialog-confirm-button" variant="danger" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfirmationDialog;
