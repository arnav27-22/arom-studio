import { useState } from 'react'
import { StatCard } from '../components/StatCard'
import { PenSquare, Save, RefreshCw, FileText, Eye, EyeOff, AlertTriangle } from 'lucide-react'

const DEFAULT_PROMPT = `# ============================================================
# AROM AI - INTELLIGENT REASONING & RESPONSE ENGINE v5.0
# ============================================================
You are AROM AI, the official AI assistant of AROM STUDIO.
Your mission is to act as an expert digital consultant: explain WHY, explain BENEFITS, explain PROCESS, and guide NEXT STEPS.
Never copy website paragraphs verbatim. Reason, synthesize, and respond naturally.`

const PROMPT_SETTINGS = {
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0.3,
  presencePenalty: 0.3,
  systemPromptVersion: '5.0',
  lastModified: new Date().toISOString(),
}

export function AIPromptManagement() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [showPreview, setShowPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const [temperature, setTemperature] = useState(PROMPT_SETTINGS.temperature)
  const [maxTokens, setMaxTokens] = useState(PROMPT_SETTINGS.maxTokens)

  const handleSave = () => {
    localStorage.setItem('arom_ai_system_prompt', prompt)
    localStorage.setItem('arom_ai_prompt_settings', JSON.stringify({ temperature, maxTokens, lastModified: new Date().toISOString() }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT)
    setTemperature(PROMPT_SETTINGS.temperature)
    setMaxTokens(PROMPT_SETTINGS.maxTokens)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
          <PenSquare className="h-5 w-5 text-accent" /> AROM AI Prompt Management
        </h2>
        <p className="text-xs text-white/50">Edit the system prompt, configure AI behavior, and manage response settings</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Prompt Version" value={PROMPT_SETTINGS.systemPromptVersion} icon={<FileText className="h-4 w-4 text-accent" />} />
        <StatCard label="Temperature" value={temperature.toFixed(1)} icon={<Eye className="h-4 w-4 text-accent" />} />
        <StatCard label="Max Tokens" value={maxTokens.toString()} icon={<FileText className="h-4 w-4 text-accent" />} />
        <StatCard label="Status" value="Editable" icon={<PenSquare className="h-4 w-4 text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass rounded-[24px] p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-accent uppercase tracking-wider">System Prompt</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer"
                title={showPreview ? 'Edit' : 'Preview'}
              >
                {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer"
                title="Reset to Default"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {showPreview ? (
            <div className="bg-black/40 rounded-2xl p-4 border border-white/10 whitespace-pre-wrap text-xs text-white/80 font-mono leading-relaxed max-h-[400px] overflow-y-auto">
              {prompt}
            </div>
          ) : (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={16}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono text-white/90 focus:outline-none focus:border-accent/40 leading-relaxed resize-y min-h-[300px]"
            />
          )}
        </div>

        <div className="glass rounded-[24px] p-6 border border-white/10">
          <h3 className="text-xs font-semibold text-accent uppercase tracking-wider mb-4">Response Settings</h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-white/60 block mb-2">Temperature: {temperature.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[10px] text-white/30 mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/60 block mb-2">Max Tokens: {maxTokens}</label>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="flex justify-between text-[10px] text-white/30 mt-1">
                <span>Short</span>
                <span>Long</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-300/80">
                These settings affect how AROM AI generates responses. Higher temperature produces more creative but less predictable answers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-emerald-400 font-medium">Settings saved!</span>}
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-all shadow-lg cursor-pointer"
        >
          <Save className="h-4 w-4" /> Save Prompt & Settings
        </button>
      </div>
    </div>
  )
}
