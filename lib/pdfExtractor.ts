/**
 * Robust Client-Side PDF Text Extractor
 * Uses standard PDF.js 3.x (compatible with all Next.js / Webpack bundles, avoiding modern toHex errors)
 */

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

async function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") return null;
  if (window.pdfjsLib) return window.pdfjsLib;

  return new Promise((resolve) => {
    const existingScript = document.querySelector('script[data-pdfjs="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        resolve(window.pdfjsLib);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.setAttribute("data-pdfjs", "true");
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      resolve(window.pdfjsLib);
    };
    script.onerror = () => {
      console.warn("Could not load external PDF.js, using fallback extractor.");
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const pdfjsLib = await loadPdfJs();
    if (pdfjsLib) {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let lastY: number | null = null;
        let pageText = "";

        for (const item of textContent.items as any[]) {
          if (!("str" in item) || !item.str) continue;

          // If vertical position changed, add a newline
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 4) {
            pageText += "\n";
          } else if (pageText.length > 0 && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
            pageText += " ";
          }

          pageText += item.str;
          lastY = item.transform[5];
        }

        fullText += pageText + "\n\n";
      }

      const trimmed = fullText.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  } catch (error) {
    console.error("PDF Extraction error:", error);
  }

  // Fallback: Read raw ASCII/UTF-8 streams from PDF buffer
  try {
    const buffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder("utf-8");
    const rawContent = textDecoder.decode(buffer);

    // Extract text between parentheses in PDF content streams: (Text) Tj or [(Text)] TJ
    const textMatches = rawContent.match(/\(([^()]{2,100})\)\s*Tj/g) || [];
    const extractedWords = textMatches.map((m) => m.replace(/^\(/, "").replace(/\)\s*Tj$/, ""));

    if (extractedWords.length > 0) {
      return extractedWords.join(" ");
    }
  } catch (fallbackError) {
    console.error("Fallback PDF extraction error:", fallbackError);
  }

  return "";
}
