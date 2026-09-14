import React from 'react';
import { Info, ExternalLink } from 'lucide-react';

export default function ResponsibleNotice({ className = '' }) {
  return (
    <div className={`p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-sm flex items-start gap-3 shadow-xs ${className}`}>
      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-medium text-amber-950">
          Responsible AI & Municipal Rules Notice
        </p>
        <p className="text-xs text-amber-800 leading-relaxed">
          AI WasteWise strictly grounds every disposal recommendation in verified local evidence.
          Waste-management practices and collection schedules may vary across Indian Urban Local Bodies (ULBs) and municipalities.
          Always cross-check specific guidelines with your local municipal sanitation authority.
        </p>
      </div>
    </div>
  );
}
