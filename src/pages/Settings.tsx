import { useState } from 'react';
import { Plus, X, Save, HardDrive, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAssets } from '../context/AssetContext';
import { getStorageUsage } from '../utils/storage';

export default function Settings() {
  const { settings, updateSettings } = useAssets();
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currency, setCurrency] = useState(settings.defaultCurrency);
  const [departments, setDepartments] = useState([...settings.departments]);
  const [locations, setLocations] = useState([...settings.locations]);
  const [newDept, setNewDept] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [aiProvider, setAiProvider] = useState(settings.aiProvider || 'huggingface');
  const [aiKey, setAiKey] = useState(settings.aiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const storage = getStorageUsage();

  const addDept = () => {
    const v = newDept.trim();
    if (v && !departments.includes(v)) {
      setDepartments([...departments, v]);
      setNewDept('');
    }
  };

  const removeDept = (d: string) => setDepartments(departments.filter((x) => x !== d));

  const addLoc = () => {
    const v = newLoc.trim();
    if (v && !locations.includes(v)) {
      setLocations([...locations, v]);
      setNewLoc('');
    }
  };

  const removeLoc = (l: string) => setLocations(locations.filter((x) => x !== l));

  const handleSave = () => {
    updateSettings({
      companyName: companyName.trim() || 'My Company',
      defaultCurrency: currency.trim() || 'SAR',
      departments,
      locations,
      aiProvider: aiProvider as 'claude' | 'chatgpt' | 'huggingface' | 'gemini',
      aiApiKey: aiKey.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* General */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">General</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              maxLength={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Departments</h2>
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
              {d}
              <button onClick={() => removeDept(d)} className="text-gray-400 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDept()}
            placeholder="New department"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={addDept}
            className="p-2 text-primary-600 border border-gray-200 rounded-lg hover:bg-primary-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Locations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Locations</h2>
        <div className="flex flex-wrap gap-2">
          {locations.map((l) => (
            <span key={l} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
              {l}
              <button onClick={() => removeLoc(l)} className="text-gray-400 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLoc}
            onChange={(e) => setNewLoc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLoc()}
            placeholder="New location"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={addLoc}
            className="p-2 text-primary-600 border border-gray-200 rounded-lg hover:bg-primary-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Integration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-800">AI Analysis</h2>
        </div>
        <p className="text-sm text-gray-500">
          Enable AI to automatically identify assets from photos. <strong className="text-green-600">100% free</strong> - no credit card needed.
        </p>

        {/* Provider selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAiProvider('claude')}
            className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
              aiProvider === 'claude'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Claude
          </button>
          <button
            onClick={() => setAiProvider('chatgpt')}
            className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
              aiProvider === 'chatgpt'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            ChatGPT
          </button>
          <button
            onClick={() => setAiProvider('huggingface')}
            className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
              aiProvider === 'huggingface'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Hugging Face
          </button>
          <button
            onClick={() => setAiProvider('gemini')}
            className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
              aiProvider === 'gemini'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Gemini
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          {(aiProvider === 'claude' || aiProvider === 'chatgpt') ? (
            <>
              <p className="font-medium mb-1">Get free OpenRouter key (gives you {aiProvider === 'claude' ? 'Claude' : 'ChatGPT'}):</p>
              <ol className="list-decimal ml-4 space-y-0.5 text-blue-700">
                <li>Open{' '}<a href="https://openrouter.ai/settings/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">openrouter.ai/settings/keys</a></li>
                <li>Sign up free (Google login works)</li>
                <li>Click "Create Key"</li>
                <li>Copy and paste it below</li>
              </ol>
              <p className="mt-1 text-xs text-blue-600">New accounts get free credits. One key works for both Claude and ChatGPT.</p>
            </>
          ) : aiProvider === 'huggingface' ? (
            <>
              <p className="font-medium mb-1">Get free Hugging Face token:</p>
              <ol className="list-decimal ml-4 space-y-0.5 text-blue-700">
                <li>Open{' '}<a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline font-medium">huggingface.co/settings/tokens</a></li>
                <li>Create free account</li>
                <li>Click "Create new token" &gt; "Read"</li>
                <li>Copy and paste it below</li>
              </ol>
            </>
          ) : (
            <>
              <p className="font-medium mb-1">Get Gemini API key:</p>
              <ol className="list-decimal ml-4 space-y-0.5 text-blue-700">
                <li>Open{' '}<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">aistudio.google.com/apikey</a></li>
                <li>Sign in with Google</li>
                <li>Click "Create API Key"</li>
                <li>Copy and paste it below</li>
              </ol>
            </>
          )}
        </div>

        {/* API Key input */}
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={aiKey}
            onChange={(e) => setAiKey(e.target.value)}
            placeholder={aiProvider === 'huggingface' ? 'hf_...' : aiProvider === 'gemini' ? 'AIza...' : 'sk-or-...'}
            className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {aiKey && (
          <p className="text-xs text-success-500">API key configured. AI analysis is enabled.</p>
        )}
      </div>

      {/* Storage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-800">Storage</h2>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Used</span>
            <span className="font-medium text-gray-700">
              {(storage.used / 1024 / 1024).toFixed(2)} MB / {(storage.total / 1024 / 1024).toFixed(0)} MB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                storage.percentage > 80 ? 'bg-danger-500' : storage.percentage > 60 ? 'bg-warning-500' : 'bg-primary-500'
              }`}
              style={{ width: `${Math.min(storage.percentage, 100)}%` }}
            />
          </div>
          {storage.percentage > 80 && (
            <p className="text-xs text-danger-500">Storage is getting full. Consider removing photos from old assets.</p>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
