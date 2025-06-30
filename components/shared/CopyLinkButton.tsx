'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CopyLinkButtonProps {
  episodeName: string;
  m3u8Link: string;
}

export function CopyLinkButton({ episodeName, m3u8Link }: CopyLinkButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (isCopied) return;

    try {
      await navigator.clipboard.writeText(m3u8Link);
      setIsCopied(true);
      toast({
        title: "Đã sao chép!",
        description: `Đã sao chép liên kết cho ${episodeName}.`,
        duration: 3000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Lỗi",
        description: "Không thể sao chép liên kết. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-between bg-gray-700/80 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
        <span className="truncate">{episodeName}</span>
        <Button
            onClick={handleCopy}
            size="sm"
            variant="ghost"
            className="ml-4 shrink-0 hover:bg-gray-600"
            aria-label="Sao chép liên kết"
        >
            {isCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
        </Button>
    </div>
  );
} 