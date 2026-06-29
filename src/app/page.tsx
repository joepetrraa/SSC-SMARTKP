"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { Bot, UploadCloud, Sparkles, X, FileText, Loader2, BookOpen, HelpCircle, FileSearch, CheckCircle2, AlertTriangle } from "lucide-react";

export default function PublicStudentArea() {
  const [studentQuery, setStudentQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAnalysisResult(null); 
    }
  };

  // --- KONEKSI LMM ASLI: FITUR TANYA JAWAB (CHAT) ---
  const askGeminiRAG = async (queryText: string) => {
    if (!queryText.trim()) return;
    setStudentQuery(queryText);
    setIsAiLoading(true);
    setAiResponse(null);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setAiResponse({
        jawaban: data.jawaban,
        sumber: data.sumber
      });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Koneksi LMM Gagal", text: error.message, customClass: { popup: "rounded-3xl" } });
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- KONEKSI LMM ASLI: FITUR ANALISIS DOKUMEN ---
  const handleAnalyzeProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAnalysisResult(data);

      Swal.fire({ icon: "success", title: "Review Selesai", text: "AI telah memberikan evaluasinya.", confirmButtonColor: "#C8102E", customClass: { popup: "rounded-3xl" } });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Analisis Gagal", text: error.message, customClass: { popup: "rounded-3xl" } });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAFA] text-gray-900 font-sans relative overflow-x-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-bg { 0% { background-position: 0 0; } 100% { background-position: 40px 40px; } }
        .animate-header-motif { animation: slide-bg 8s linear infinite; }
      `}} />

      {/* HEADER MERAH PREMIUM */}
      <header className="fixed top-0 left-0 right-0 w-full z-[60] shadow-[0_10px_30px_rgba(200,16,46,0.15)] border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a0a1c] via-[#C8102E] to-[#7a0a1c] overflow-hidden -z-10">
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay animate-header-motif pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 20c0-11.046 8.954-20 20-20v20H20zM0 20c11.046 0 20-8.954 20-20v20H0zM0 40c0-11.046 8.954-20 20-20v20H0zM20 40c11.046 0 20-8.954 20-20v20H20z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="w-full mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between h-20 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-[#C8102E]">T</span>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-bold text-lg sm:text-xl tracking-wide text-white leading-tight drop-shadow-md">SSC SMARTKP</h1>
              <p className="text-xs text-red-200 hidden sm:block font-medium drop-shadow-md">Layanan Informasi Publik & Konsultasi AI</p>
            </div>
          </div>
          <a href="/admin" className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white text-xs font-bold rounded-full transition-all flex items-center gap-2">Login Admin</a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full mx-auto px-4 sm:px-8 lg:px-12 pt-28 pb-16 relative z-10 space-y-8 max-w-7xl">
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 text-center">
          <span className="px-3 py-1 bg-red-50 text-[#C8102E] rounded-full text-[10px] font-black tracking-widest uppercase inline-block mb-3">Telkom University Surabaya</span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 mb-2">Portal <span className="text-[#C8102E]">Kerja Praktik</span> LMM</h2>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">Mesin AI Terkoneksi API Langsung. Silakan konsultasi aturan atau unggah draf proposal Anda untuk ekstraksi dan penilaian otomatis.</p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* KIRI: CHAT LMM NYATA */}
          <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-red-50 text-[#C8102E] rounded-xl flex items-center justify-center"><Bot size={22} /></div>
                <div>
                  <h3 className="font-black text-base text-gray-900">AI Konsultan Reguler</h3>
                  <p className="text-xs text-gray-500 font-medium">Respons Dihasilkan Live via Google Gemini</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={studentQuery}
                  onKeyDown={(e) => { if (e.key === 'Enter') askGeminiRAG(studentQuery); }}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Ketik pertanyaan terkait aturan KP..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C8102E] focus:bg-white transition-all text-gray-900"
                />
                <button
                  onClick={() => askGeminiRAG(studentQuery)}
                  disabled={isAiLoading || !studentQuery.trim()}
                  className="bg-[#C8102E] hover:bg-red-800 text-white font-bold px-5 py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Kirim Prompt
                </button>
              </div>
            </div>

            <div className="mt-6 min-h-[160px] bg-gray-50 border border-gray-100 rounded-2xl p-5 relative flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {isAiLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
                    <Loader2 size={28} className="text-[#C8102E] animate-spin" />
                    <p className="text-xs font-bold text-gray-500 animate-pulse">LMM Sedang Berpikir...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {aiResponse ? (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-left">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#C8102E] block mb-1">Generasi Teks LMM</span>
                    <div className="text-sm font-semibold text-gray-800 leading-relaxed whitespace-pre-wrap">{aiResponse.jawaban}</div>
                  </div>
                  <div className="pt-2.5 border-t border-gray-200 flex justify-between text-[10px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5"><BookOpen size={12} className="text-[#C8102E]" /> Di-grounding oleh: {aiResponse.sumber}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-6">
                  <HelpCircle size={32} className="mb-2 opacity-40 text-[#C8102E]" />
                  <p className="text-xs font-medium">Ruang chat kosong. Tunggu perintah Anda.</p>
                </div>
              )}
            </div>
          </div>

          {/* KANAN: ANALISIS DOKUMEN NYATA */}
          <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3.5 mb-6 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><FileSearch size={22} /></div>
              <div>
                <h3 className="font-black text-base text-gray-900">Validasi File PDF Asli</h3>
                <p className="text-xs text-gray-500 font-medium">LMM akan mengekstrak teks file Anda</p>
              </div>
            </div>

            <form onSubmit={handleAnalyzeProposal} className="space-y-4">
              <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 rounded-2xl p-6 min-h-[140px] flex flex-col items-center justify-center transition-all cursor-pointer text-center ${selectedFile ? 'border-blue-300 bg-blue-50/50' : 'border-gray-300 border-dashed hover:border-[#C8102E]/40 bg-gray-50'}`}
              >
                {selectedFile ? (
                  <>
                    <FileText size={32} className="text-blue-600 mb-2" />
                    <p className="font-bold text-sm text-gray-800">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Siap dikirim ke LMM</p>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} className="text-gray-400 mb-2" />
                    <p className="font-bold text-sm text-gray-800">Unggah Draf Proposal (Wajib PDF)</p>
                    <p className="text-xs text-gray-500 mt-1">Sistem akan mengekstrak teks asli dokumen Anda.</p>
                  </>
                )}
              </div>

              <button type="submit" disabled={!selectedFile || isAnalyzing} className="w-full px-6 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                {isAnalyzing ? "Mengekstrak PDF & Generasi JSON..." : "Kirim Dokumen ke Server"}
              </button>
            </form>

            <AnimatePresence>
              {analysisResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 border-t border-gray-100 pt-6 overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black ${analysisResult.score >= 70 ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}>
                      {analysisResult.score}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{analysisResult.status}</h4>
                      <p className="text-xs text-gray-500">Skor Kesesuaian LMM</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Rincian Evaluasi Model:</p>
                    {analysisResult.feedbacks?.map((fb: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg text-xs font-medium text-gray-700">
                        <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <p>{fb}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}