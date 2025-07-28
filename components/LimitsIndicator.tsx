import React from 'react';

interface LimitsIndicatorProps {
  showStories?: boolean;
  showMessages?: boolean;
  compact?: boolean;
}

export const LimitsIndicator: React.FC<LimitsIndicatorProps> = ({
  showStories = true,
  showMessages = true,
  compact = false,
}) => {
  // Повністю прибираємо показ індикаторів лімітів
  return null;
}; 