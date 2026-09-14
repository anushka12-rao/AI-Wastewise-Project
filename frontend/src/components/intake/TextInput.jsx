import React from 'react';
import { Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'Greasy pizza delivery cardboard box',
  'Used lithium-ion phone battery',
  'Empty shampoo plastic bottle (HDPE)',
  'Medicine strip with leftover tablets',
  'Kitchen vegetable scraps and eggshells',
  'Sanitary napkin wrapped in newspaper',
  'Broken glass bottle with metal cap'
];

export default function TextInput({ value, onChange, disabled }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Describe the waste item, its condition, and any contamination (e.g. 'greasy pizza box with food remnants', 'used laptop charger cable', 'blister pack of expired paracetamol')..."
          className="w-full rounded-2xl border border-slate-300 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all resize-none shadow-xs disabled:opacity-50"
          maxLength={500}
        />
        <div className="absolute bottom-3 right-3 text-[11px] text-slate-400 font-mono">
          {value.length}/500
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Quick Example Scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(item)}
              disabled={disabled}
              className="text-xs bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 px-2.5 py-1 rounded-lg transition-colors border border-slate-200/80 disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
