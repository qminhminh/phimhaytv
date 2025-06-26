'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2 border-primary/50 bg-transparent text-primary/90 hover:bg-primary/10 hover:text-primary">
      <RefreshCw size={16} />
      Tải lại trang
    </Button>
  );
} 