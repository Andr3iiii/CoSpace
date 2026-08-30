import React from 'react';
import { theme } from '../../theme/theme';

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        borderBottom: `1px solid ${theme.colors.border}`,
        marginBottom: '20px',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: isActive ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
              color: isActive ? theme.colors.text : theme.colors.textMuted,
              fontWeight: isActive ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium,
              fontSize: theme.typography.fontSize.sm,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? theme.colors.primaryLight : theme.colors.surfaceHover,
                  color: isActive ? theme.colors.primary : theme.colors.textDim,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
