import React from 'react';

const streamStyles = {
  WET_WASTE: {
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
    label: 'Wet Waste (Green Bin)'
  },
  DRY_WASTE: {
    bg: 'bg-sky-100 text-sky-800 border-sky-300',
    dot: 'bg-sky-500',
    label: 'Dry Waste (Blue Bin)'
  },
  SANITARY_WASTE: {
    bg: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-500',
    label: 'Sanitary Waste (Red Bin / Wrap Securely)'
  },
  SPECIAL_CARE_WASTE: {
    bg: 'bg-amber-100 text-amber-900 border-amber-300',
    dot: 'bg-amber-500',
    label: 'Special Care / Hazardous Waste'
  }
};

export default function StreamBadge({ stream, className = '' }) {
  const config = streamStyles[stream] || {
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    dot: 'bg-slate-500',
    label: stream || 'Uncategorized'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
