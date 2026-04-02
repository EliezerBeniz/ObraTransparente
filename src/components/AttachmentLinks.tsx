import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Attachment } from '@/lib/types';

interface AttachmentLinksProps {
  attachments: Attachment[];
}

export function AttachmentLinks({ attachments }: AttachmentLinksProps) {
  if (!attachments || attachments.length === 0) {
    return <span className="text-xs text-tertiary/40">-</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 p-2 text-primary hover:bg-primary/5 rounded-architectural transition-all opacity-80 hover:opacity-100 group"
          title={attachment.label || 'Ver comprovante'}
        >
          <span className="text-[10px] uppercase font-body group-hover:underline">
            {attachment.label || 'Comprovante'}
          </span>
          <ExternalLink size={12} />
        </a>
      ))}
    </div>
  );
}
