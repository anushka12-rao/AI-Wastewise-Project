import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, FileText, Sparkles, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import ImageUploader from '../components/intake/ImageUploader';
import TextInput from '../components/intake/TextInput';
import ResultConfident from '../components/result/ResultConfident';
import ResultUncertain from '../components/result/ResultUncertain';
import ResultCoverageInsufficient from '../components/result/ResultCoverageInsufficient';
import ResponsibleNotice from '../components/common/ResponsibleNotice';
import { analyzeWaste } from '../services/analyzeService';

export default function WasteIntake() {
  const navigate = useNavigate();
  const [intakeMode, setIntakeMode] = useState('image'); // 'image' | 'text'
  const [imageBase64, setImageBase64] = useState('');
  const [textDescription, setTextDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (intakeMode === 'image' && !imageBase64) {
      setError('Please upload an image of the waste item to analyze.');
      return;
    }
    if (intakeMode === 'text' && (!textDescription || textDescription.trim().length < 3)) {
      setError('Please provide a descriptive explanation of the waste item (at least 3 characters).');
      return;
    }

    setLoading(true);
    setLoadingStep(1);

    // Realistic step progression for user feedback
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 700);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 1400);

    try {
      const payload = intakeMode === 'image' 
        ? { imageBase64 } 
        : { textDescription: textDescription.trim() };

      const data = await analyzeWaste(payload);
      setResult(data);
    } catch (err) {
      console.error('Analyze error:', err);
      setError(err.response?.data?.message || err.message || 'Analysis service temporarily unavailable. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setImageBase64('');
    setTextDescription('');
    setError('');
  };

  const handleAskFollowUp = () => {
    if (!result) return;
    navigate('/ask', {
      state: {
        priorCategory: result.category,
        priorSourceIds: (result.sources || []).map(s => s._id || s.id),
        initialContext: `I have a question regarding disposal of: ${result.category?.replace(/_/g, ' ')}`
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Identify Waste Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload a clear photograph or describe the waste item to retrieve verified segregation guidance.
        </p>
      </div>

      {/* If result is present, render outcome */}
      {result ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Identify Another Item</span>
            </button>
            <span className="text-xs text-slate-400 font-mono">
              Outcome: {result.outcome}
            </span>
          </div>

          {result.outcome === 'CONFIDENT' && (
            <ResultConfident result={result} onAskFollowUp={handleAskFollowUp} />
          )}

          {result.outcome === 'UNCERTAIN' && (
            <ResultUncertain result={result} onRetry={handleReset} />
          )}

          {result.outcome === 'COVERAGE_INSUFFICIENT' && (
            <ResultCoverageInsufficient result={result} onRetry={handleReset} />
          )}

          <ResponsibleNotice />
        </div>
      ) : (
        /* Intake Form */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Intake Mode Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl max-w-sm">
            <button
              type="button"
              onClick={() => { setIntakeMode('image'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                intakeMode === 'image'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4 text-brand-600" />
              <span>Photo Upload</span>
            </button>
            <button
              type="button"
              onClick={() => { setIntakeMode('text'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                intakeMode === 'text'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Text Description</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {intakeMode === 'image' ? (
              <ImageUploader
                imageBase64={imageBase64}
                onImageSelected={setImageBase64}
                onClearImage={() => setImageBase64('')}
                disabled={loading}
              />
            ) : (
              <TextInput
                value={textDescription}
                onChange={setTextDescription}
                disabled={loading}
              />
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading Indicator with Stage Progression */}
            {loading ? (
              <div className="p-6 rounded-2xl bg-brand-50/70 border border-brand-200 text-center space-y-3">
                <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">
                    {loadingStep === 1 && 'Step 1: Identifying waste category via IBM Granite...'}
                    {loadingStep === 2 && 'Step 2: Testing Gate 1 & searching LanceDB RAG...'}
                    {loadingStep === 3 && 'Step 3: Grounding disposal guidance in local evidence...'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Verifying evidence against Indian municipal guidelines
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze & Retrieve Guidance</span>
              </button>
            )}
          </form>

          <ResponsibleNotice />
        </div>
      )}
    </div>
  );
}
