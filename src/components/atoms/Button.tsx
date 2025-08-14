import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseStyle = 'px-5 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';
  let variantStyle = '';

  switch (variant) {
    case 'primary':
      variantStyle = 'bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500';
      break;
    case 'secondary':
      variantStyle = 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300 border border-gray-300';
      break;
    case 'danger':
      variantStyle = 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-500';
      break;
    default:
      variantStyle = 'bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500';
  }

  return (
    <button data-testid={`button-${variant}`} className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
