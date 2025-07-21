import React from 'react';
import { PermissionGate } from './index';
import { Button } from '../Button';

type UserRole = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';

interface PermissionButtonProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAllRoles?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fallbackText?: string; // Texto a ser mostrado se não tiver permissão
  showFallback?: boolean; // Se deve mostrar um botão desabilitado como fallback
}

const PermissionButton: React.FC<PermissionButtonProps> = ({
  children,
  allowedRoles,
  requireAllRoles = false,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className,
  fallbackText,
  showFallback = false,
  ...props
}) => {
  const fallbackButton = showFallback ? (
    <Button
      variant={variant}
      size={size}
      disabled={true}
      className={className}
      {...props}
    >
      {fallbackText || children}
    </Button>
  ) : null;

  return (
    <PermissionGate
      allowedRoles={allowedRoles}
      requireAllRoles={requireAllRoles}
      fallback={fallbackButton}
    >
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onClick}
        className={className}
        {...props}
      >
        {children}
      </Button>
    </PermissionGate>
  );
};

export default PermissionButton;