import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

export interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const StyledCard = styled.div<CardProps>`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  transition: ${theme.transitions.normal};
  
  /* Padding */
  ${({ padding }) => {
    switch (padding) {
      case 'sm':
        return css`padding: ${theme.spacing.sm};`;
      case 'lg':
        return css`padding: ${theme.spacing.xl};`;
      default:
        return css`padding: ${theme.spacing.lg};`;
    }
  }}
  
  /* Shadow */
  ${({ shadow }) => {
    switch (shadow) {
      case 'sm':
        return css`box-shadow: ${theme.shadows.sm};`;
      case 'lg':
        return css`box-shadow: ${theme.shadows.lg};`;
      case 'xl':
        return css`box-shadow: ${theme.shadows.xl};`;
      default:
        return css`box-shadow: ${theme.shadows.md};`;
    }
  }}
  
  /* Hover effect */
  ${({ hover }) => hover && css`
    &:hover {
      box-shadow: ${theme.shadows.lg};
      transform: translateY(-2px);
    }
  `}
`;

const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray};
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 0;
  }
`;

const StyledCardBody = styled.div`
  flex: 1;
`;

const StyledCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.gray};
`;

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  shadow = 'md',
  hover = false,
  className,
  ...props
}) => {
  return (
    <StyledCard
      padding={padding}
      shadow={shadow}
      hover={hover}
      className={className}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return <StyledCardHeader className={className}>{children}</StyledCardHeader>;
};

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return <StyledCardBody className={className}>{children}</StyledCardBody>;
};

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return <StyledCardFooter className={className}>{children}</StyledCardFooter>;
};

export default Card;