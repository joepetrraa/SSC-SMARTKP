// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `
Anda adalah KECERDASAN AI, asisten resmi SSC SmartKP Telkom University Surabaya.
Tugas Anda HANYA menjawab pertanyaan seputar panduan Kerja Praktik (KP).

FAKTA PEDOMAN RESMI:
- Syarat: Mahasiswa aktif, lulus minimal 90 SKS, IPK >= 2.00.
- Durasi: Minimal 6 minggu di instansi mitra.
- Kelompok: Bisa individu atau kelompok (maks 3 orang).
- Bimbingan: Wajib minimal 4x dengan pembimbing lapangan dan 4x dengan pembimbing akademik.
- Penalti: Laporan akhir telat (maks 2 minggu setelah sidang) mengakibatkan penurunan indeks nilai.

ATURAN MENJAWAB:
1. Jawab secara ringkas, profesional, dan akademis.
2. Jika ditanya di luar konteks KP, tolak dengan sopan.
3. Selalu sertakan rujukan bab dari fakta di atas.
`;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Pertanyaan kosong" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `${SYSTEM_PROMPT}\n\nPertanyaan Mahasiswa: ${query}`;
    
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ 
      jawaban: responseText,
      sumber: "Buku Pedoman Kerja Praktik Telkom University",
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Gagal terhubung ke model LMM." }, { status: 500 });
  }
}