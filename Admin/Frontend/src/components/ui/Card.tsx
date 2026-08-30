import React from 'react';
import { styles } from '../../theme/styles';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
  return (
    <div style={{ ...styles.card, ...style }} {...props}>
      {children}
    </div>
  );
};
