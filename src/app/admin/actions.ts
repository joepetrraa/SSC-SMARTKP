// src/app/admin/actions.ts
"use server";

// Menggunakan jalur mundur 2 kali untuk menuju src/lib/prisma.ts
import { prisma } from "../../lib/prisma";
import * as pdfParse from "pdf-parse";

export async function uploadGuidelineDocument(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("File tidak ditemukan.");
    }

    const title = file.name;
    
    // 1. Simpan baris awal dokumen ke database dengan status "Processing"
    const doc = await prisma.document.create({
      data: {
        title: title,
        description: "Buku Pedoman Resmi institusi yang diekstrak oleh sistem LMM.",
        url: `/uploads/${Date.now()}_${title}`,
        status: "Processing"
      }
    });

    // 2. Ekstrak Teks dari PDF asli
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Pelindung Dinamis untuk menjamin fungsi pemecah PDF selalu tereksekusi dengan benar
    // @ts-ignore
    const parseFunction = typeof pdfParse === "function" 
      ? pdfParse 
      // @ts-ignore
      : (pdfParse.default || (pdfParse as any));

    const pdfData = await parseFunction(buffer);
    const extractedText = pdfData.text;

    if (!extractedText || !extractedText.trim()) {
      await prisma.document.update({
        where: { id: doc.id },
        data: { status: "Uploaded" }
      });
      throw new Error("Gagal mengekstrak teks. PDF kemungkinan berupa gambar scan.");
    }

    // 3. Pecah teks menjadi chunks dan simpan
    await prisma.documentChunk.create({
      data: {
        content: extractedText.substring(0, 30000), 
        embedding: "[]", 
        documentId: doc.id
      }
    });

    // 4. Update status dokumen menjadi "Ready"
    const updatedDoc = await prisma.document.update({
      where: { id: doc.id },
      data: { status: "Ready" }
    });

    return { success: true, document: updatedDoc };

  } catch (error: any) {
    console.error("Admin Upload Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminDocuments() {
  try {
    return await prisma.document.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Fetch Admin Docs Error:", error);
    return [];
  }
}

export async function deleteAdminDocument(id: string) {
  try {
    await prisma.document.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Delete Admin Doc Error:", error);
    return { success: false };
  }
}