import React, { useState } from 'react';
import type { MCQQuestion } from '../types';
import { parseMCQMarkdown, exportToMarkdown } from '../utils/markdownParser';
import { INITIAL_MARKDOWN } from '../data/defaultQuestions';
import {
  Upload,
  Download,
  FileText,
  Check,
  AlertCircle,
  Copy,
  RefreshCw,
  Sparkles,
  HelpCircle,
  FileCode,
} from 'lucide-react';

interface Props {
  currentQuestions: MCQQuestion[];
  onImportQuestions: (newQuestions: MCQQuestion[], replaceAll: boolean) => void;
  onResetToDefaults: () => void;
}

export const ImportExportView: React.FC<Props> = ({
  currentQuestions,
  onImportQuestions,
  onResetToDefaults,
}) => {
  const [markdownText, setMarkdownText] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<MCQQuestion[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleTextChange = (text: string) => {
    setMarkdownText(text);
    setImportSuccess(null);
    if (!text.trim()) {
      setPreviewQuestions([]);
      setParseError(null);
      return;
    }

    try {
      const parsed = parseMCQMarkdown(text);
      setPreviewQuestions(parsed);
      if (parsed.length === 0) {
        setParseError('Aucun QCM détecté. Vérifiez le format (titre #, question ### et propositions [True]/[False]).');
      } else {
        setParseError(null);
      }
    } catch (err: any) {
      setParseError(`Erreur d'analyse : ${err?.message || 'Format invalide'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  const executeImport = (replaceAll: boolean) => {
    if (previewQuestions.length === 0) return;
    onImportQuestions(previewQuestions, replaceAll);
    setImportSuccess(
      `${previewQuestions.length} QCM importés avec succès (${replaceAll ? 'Banque remplacée' : 'Ajoutés à votre banque'}) !`
    );
    setMarkdownText('');
    setPreviewQuestions([]);
  };

  const handleDownloadMarkdown = () => {
    const md = exportToMarkdown(currentQuestions);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medmcq_banque_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const json = JSON.stringify(currentQuestions, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medmcq_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExampleTemplate = () => {
    handleTextChange(INITIAL_MARKDOWN);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-400" />
              Importer &amp; Exporter vos QCM Markdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Glissez votre fichier <code>.md</code> ou collez directement vos questions pour les réviser hors-ligne sur votre téléphone.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Exporter en .MD</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span>Sauvegarde JSON</span>
            </button>
          </div>
        </div>

        {/* Format Explanation Guide */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-teal-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Structure acceptée (votre format standard) :
            </span>
            <button
              onClick={loadExampleTemplate}
              className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Charger un exemple type
            </button>
          </div>

          <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`# Nom du Thème (ex: Infarctus du myocarde)

### Q 1  Intitulé de votre question médicale ?

- Première proposition [True]
- Deuxième proposition [False]
- Troisième proposition [True]

**Explanation:**
> Explication clinique et rappel des recommandations...

---`}
          </pre>
        </div>

        {/* Text Input Area & File Upload */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Contenu Markdown
            </label>
            <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold">
              <Upload className="w-3.5 h-3.5" />
              <span>Ouvrir un fichier .md</span>
              <input
                type="file"
                accept=".md,.txt,.markdown"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={markdownText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Collez ici votre texte markdown avec vos thèmes et vos questions..."
            rows={10}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-teal-500 transition leading-relaxed"
          />

          {/* Feedback & Parsing status */}
          {parseError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}

          {previewQuestions.length > 0 && (
            <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-teal-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    {previewQuestions.length} QCM prêts à être importés
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Thèmes détectés :{' '}
                    {Array.from(new Set(previewQuestions.map((q) => q.topicName))).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => executeImport(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
                  >
                    Ajouter à l'existant
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Attention : cela remplacera toute votre banque actuelle par ces nouveaux QCM. Confirmer ?')) {
                        executeImport(true);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-md transition"
                  >
                    Remplacer toute la banque
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reset button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Vous souhaitez recharger les questions fournies initialement ?</span>
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous restaurer la banque de questions par défaut ?')) {
                onResetToDefaults();
                setImportSuccess('Banque par défaut restaurée avec succès !');
              }
            }}
            className="text-xs text-rose-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurer questions initiales</span>
          </button>
        </div>
      </div>
    </div>
  );
};
