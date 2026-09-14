import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, ArrowRight, BookOpen, Layers, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import ResponsibleNotice from '../components/common/ResponsibleNotice';

export default function Home() {
  const streams = [
    {
      title: 'Wet Waste',
      color: 'border-emerald-500 bg-emerald-50 text-emerald-950',
      badge: 'bg-emerald-600 text-white',
      desc: 'Cooked/raw food scraps, fruit peels, tea leaves, garden leaves, compostable organic items.'
    },
    {
      title: 'Dry Waste',
      color: 'border-sky-500 bg-sky-50 text-sky-950',
      badge: 'bg-sky-600 text-white',
      desc: 'Paper, cardboard, clean plastic bottles/containers, metal cans, glass bottles, clean textiles.'
    },
    {
      title: 'Sanitary Waste',
      color: 'border-rose-500 bg-rose-50 text-rose-950',
      badge: 'bg-rose-600 text-white',
      desc: 'Diapers, sanitary pads, soiled bandages, cotton swabs. Must be wrapped securely in paper.'
    },
    {
      title: 'Special Care / E-Waste',
      color: 'border-amber-500 bg-amber-50 text-amber-950',
      badge: 'bg-amber-600 text-white',
      desc: 'Batteries, electronics, discarded medicines, paint cans, tube lights, fluorescent bulbs.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Aligned with UN SDG 12 — Responsible Consumption and Production</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
          Segregate Waste with <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-700">
            Explainable, Grounded AI
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          AI WasteWise helps citizens identify tricky, mixed, or contaminated waste items,
          segregating them accurately with verifiable local Indian municipal guidelines.
          <strong> Zero invented rules — 100% grounded in evidence.</strong>
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/intake"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Identify Waste Item</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/ask"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-2xs transition-all"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Ask WasteWise (Q&A)</span>
          </Link>
        </div>

        <div className="mt-8 max-w-xl mx-auto">
          <ResponsibleNotice />
        </div>
      </section>

      {/* Two-Gate Architecture Explanation */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-slate-900">How AI WasteWise Solves Hallucinations</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Two sequential verification gates protect every disposal recommendation before IBM Granite generates advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm">1</span>
                <span className="text-[11px] font-semibold text-slate-500">Multimodal AI</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">AI Identification</h3>
              <p className="text-xs text-slate-600 leading-relaxed flex-grow">
                Granite Vision or Granite Text classifies the item across 22 granular waste categories.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-amber-700 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Gate 1: Stops if confidence &lt; 70% (UNCERTAIN)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm">2</span>
                <span className="text-[11px] font-semibold text-slate-500">Vector Search</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">RAG Knowledge Retrieval</h3>
              <p className="text-xs text-slate-600 leading-relaxed flex-grow">
                LanceDB retrieves verified municipal guidelines for the identified category and jurisdiction.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-sky-700 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Gate 2: Stops if score &lt; 65% (COVERAGE INSUFFICIENT)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">3</span>
                <span className="text-[11px] font-semibold text-slate-500">Strict Synthesis</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Grounded Generation</h3>
              <p className="text-xs text-slate-600 leading-relaxed flex-grow">
                IBM Granite generates practical disposal advice, citing the exact retrieved source documents.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Only invoked when BOTH gates pass (CONFIDENT)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Indian 4-Stream Segregation Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Indian 4-Stream Segregation Reference</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Standard waste segregation framework recognized by Indian ULBs and Swachh Bharat Mission.
            </p>
          </div>
          <Link
            to="/intake"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Analyze your waste item</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {streams.map((stream, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border-2 p-5 ${stream.color} shadow-2xs flex flex-col justify-between`}
            >
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mb-3 ${stream.badge}`}>
                  {stream.title}
                </span>
                <p className="text-xs leading-relaxed opacity-90">
                  {stream.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-current/20 text-[11px] font-semibold opacity-80 flex items-center justify-between">
                <span>ULB Standard</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
