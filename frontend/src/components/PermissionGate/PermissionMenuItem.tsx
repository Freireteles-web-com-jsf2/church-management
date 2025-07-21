import React from 'react';
import { PermissionGate } from './index';

type UserRole = 'admin' | 'pastor' | 'lider' | 'tesoureiro' | 'voluntario' | 'membro';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  to?: string;
  onClick?: () => void;
  roles?: UserRole[];
  requireAllRoles?: boolean;
  children?: MenuItem[];
  badge?: string | number;
  isActive?: boolean;
}

interface PermissionMenuItemProps {
  item: MenuItem;
  onItemClick?: (item: MenuItem) => void;
  renderItem?: (item: MenuItem) => React.ReactNode;
  className?: string;
}

const PermissionMenuItem: React.FC<PermissionMenuItemProps> = ({
  item,
  onItemClick,
  renderItem,
  className
}) => {
  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const menuItemContent = renderItem ? renderItem(item) : (
    <div 
      className={`menu-item ${className || ''} ${item.isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <span className="menu-icon">{item.icon}</span>
      <span className="menu-label">{item.label}</span>
      {item.badge && <span className="menu-badge">{item.badge}</span>}
    </div>
  );

  return (
    <PermissionGate
      allowedRoles={item.roles}
      requireAllRoles={item.requireAllRoles}
    >
      {menuItemContent}
      {/* Renderizar sub-itens se existirem */}
      {item.children && item.children.length > 0 && (
        <div className="menu-children">
          {item.children.map((child, index) => (
            <PermissionMenuItem
              key={index}
              item={child}
              onItemClick={onItemClick}
              renderItem={renderItem}
              className={`${className} child-item`}
            />
          ))}
        </div>
      )}
    </PermissionGate>
  );
};

export default PermissionMenuItem;