"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText, CheckCircle2, Trash2, Loader2, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { uploadGuidelineDocument, getAdminDocuments, deleteAdminDocument } from "./actions";

export default function AdminArea() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ambil data asli dari SQLite saat halaman dimuat
  const fetchDocuments = async () => {
    setIsFetching(true);
    const docs = await getAdminDocuments();
    setDocuments(docs);
    setIsFetching(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handler Unggah PDF Asli
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      Swal.fire({ icon: "error", title: "Format Salah", text: "Admin hanya diizinkan mengunggah file format PDF.", confirmButtonColor: "#C8102E" });
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadGuidelineDocument(formData);
    
    setIsUploading(false);

    if (result.success) {
      Swal.fire({
        icon: "success",
        title: "Koneksi LMM Berhasil",
        text: "Teks PDF berhasil diekstrak dan diindeks ke dalam database.",
        confirmButtonColor: "#C8102E",
        customClass: { popup: "rounded-3xl" }
      });
      fetchDocuments(); // Refresh daftar dokumen
    } else {
      Swal.fire({ icon: "error", title: "Gagal Mengindeks", text: result.error, confirmButtonColor: "#C8102E" });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handler Hapus Dokumen
  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Dokumen ini akan dihapus dari basis pengetahuan otentik AI.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C8102E",
      cancelButtonColor: "#333333",
      confirmButtonText: "Hapus",
      customClass: { popup: "rounded-3xl" }
    });

    if (confirm.isConfirmed) {
      const res = await deleteAdminDocument(id);
      if (res.success) {
        Swal.fire("Terhapus!", "Dokumen telah dikeluarkan dari sistem.", "success");
        fetchDocuments();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-red-700 font-bold text-sm transition-colors">
          <ArrowLeft size={16} /> Kembali ke Publik
        </button>
        <button onClick={fetchDocuments} className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 transition-all flex items-center gap-1 text-xs font-bold shadow-sm">
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Sinkronisasi Data
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Knowledge Base Administrator</h1>
        <p className="text-gray-500 text-xs sm:text-sm mb-8">Kelola berkas regulasi tunggal (Single Source of Truth) untuk pembatasan instruksi RAG AI.</p>

        {/* Kotak Dropzone Unggah File */}
        <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${isUploading ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : 'border-gray-300 bg-gray-50 hover:bg-red-50/50 hover:border-[#C8102E] cursor-pointer'}`}
        >
          {isUploading ? (
            <div className="space-y-3">
              <Loader2 size={40} className="text-[#C8102E] animate-spin mx-auto" />
              <p className="font-bold text-gray-800 text-sm">Membaca Struktur Biner PDF...</p>
              <p className="text-xs text-gray-400">Server sedang menjalankan fungsi pdf-parse & menyusun struktur tabel.</p>
            </div>
          ) : (
            <>
              <Upload size={40} className="text-gray-400 mx-auto mb-4" />
              <p className="font-bold text-gray-800 text-sm">Klik untuk Unggah Buku Pedoman Baru</p>
              <p className="text-xs text-gray-400 mt-1">Sistem otomatis mengekstrak seluruh teks halaman dokumen secara real-time.</p>
            </>
          )}
        </div>

        {/* Daftar Berkas Hasil Sinkronisasi SQLite */}
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 mt-8">Dokumen Terindeks Aktif ({documents.length})</h2>
        
        {isFetching ? (
          <div className="text-center py-8 text-xs font-bold text-gray-400 animate-pulse">Memuat data dari SQLite...</div>
        ) : (
          <div className="space-y-3">
            {documents.length > 0 ? documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm transition-all hover:border-gray-200">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 bg-red-50 text-[#C8102E] rounded-lg shrink-0"><FileText size={20} /></div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate pr-2">{doc.title}</p>
                    <p className="text-[11px] text-green-600 flex items-center gap-1 font-bold mt-0.5">
                      <CheckCircle2 size={12} /> Status: {doc.status}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-400 font-medium">
                Belum ada berkas acuan di database. AI saat ini berjalan menggunakan prompt cadangan default.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}