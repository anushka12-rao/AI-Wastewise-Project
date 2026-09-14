import React from 'react';
import { Leaf, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Leaf className="w-5 h-5 text-brand-400" />
              <span>AI WasteWise</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              Intelligent Waste Identification, Segregation & Responsible Disposal Assistant.
              Developed for the 1M1B AI for Sustainability Virtual Internship with IBM SkillsBuild & AICTE.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs bg-slate-800 text-brand-300 px-2.5 py-1 rounded-md border border-slate-700">
                UN SDG 12: Responsible Consumption
              </span>
              <span className="text-xs bg-slate-800 text-blue-300 px-2.5 py-1 rounded-md border border-slate-700">
                IBM watsonx.ai & Granite
              </span>
              <span className="text-xs bg-slate-800 text-amber-300 px-2.5 py-1 rounded-md border border-slate-700">
                LanceDB RAG
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Primary Streams</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Wet Waste (Compostable)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Dry Waste (Recyclable)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Sanitary Waste (Incineration)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Special Care & E-Waste</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Responsible AI Guardrails</h4>
            <p className="text-xs leading-relaxed text-slate-400">
              Grounded generation guarantees Granite never hallucinates disposal rules. Responses are strictly anchored in retrieved ULB/Indian municipal evidence.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AI WasteWise. Built for 1M1B AI for Sustainability.</p>
          <p className="flex items-center gap-1">
            Grounded by IBM Granite & Slate <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
