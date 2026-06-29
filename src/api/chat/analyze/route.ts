// src/app/api/analyze/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import * as pdfParse from "pdf-parse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File proposal tidak ditemukan." }, { status: 400 });
    }

    // 1. Ekstrak Teks dari ArrayBuffer PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Menggunakan pemanggilan modul esm/namespace secara aman
    // @ts-ignore
    const pdfData = await (pdfParse.default ? pdfParse.default(buffer) : pdfParse(buffer));
    const extractedText = pdfData.text.substring(0, 12000); 

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "Gagal mengekstrak teks. Pastikan PDF bukan hasil scan gambar." }, { status: 400 });
    }

    // 2. Evaluasi menggunakan Prompt Ketat Google Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Anda adalah dosen reviewer akademik untuk komite Kerja Praktik (KP) Telkom University Surabaya.
      Tugas Anda adalah mengevaluasi kelayakan draf proposal yang diunggah mahasiswa berdasarkan parameter regulasi resmi.
      
      Aturan Kelayakan Berdasarkan Pedoman Resmi Kampus:
      1. Syarat Administrasi: Lulus minimal 90 SKS dan IPK minimal 2.00.
      2. Durasi Pelaksanaan: Minimal wajib 6 minggu di instansi mitra.
      3. Sistematika Penyusunan Proposal (Tabel 1): Harus mencakup Halaman Judul, Lembar Persetujuan, Daftar Isi, Bab 1 Pendahuluan (Latar Belakang, Tujuan, Manfaat), Bab 2 Metodologi (Tinjauan Teori, Rencana Kegiatan, Waktu Pelaksanaan), dan Bab 3 Penutup.
      
      Teks Hasil Ekstraksi Proposal Mahasiswa:
      \"\"\"${extractedText}\"\"\"

      Analisislah teks di atas. Berikan penilaian objektif. Anda WAJIB merespons HANYA dengan format JSON mentah tanpa markdown (jangan gunakan bungkus \`\`\`json) dengan struktur persis seperti berikut:
      {
        "score": (berikan skor angka 0 sampai 100),
        "status": "(Memenuhi Syarat / Perlu Revisi / Ditolak)",
        "feedbacks": ["poin analisis 1", "poin analisis 2", "poin analisis 3"]
      }
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();
    
    // Antisipasi jika LLM tetap mengembalikan markdown block
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    }
    
    const analysisResult = JSON.parse(responseText);
    return NextResponse.json(analysisResult);

  } catch (error: any) {
    console.error("Analysis Server Error:", error);
    return NextResponse.json({ error: `Gagal menganalisis dokumen: ${error.message}` }, { status: 500 });
  }
}