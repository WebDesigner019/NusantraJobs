// Client-side PDF text extraction using pdfjs-dist.
// MVP: returns raw text. Production: swap for Azure AI Document Intelligence.

export async function extractTextFromPdf(file: File): Promise<string> {
  // Dynamic imports keep pdfjs out of the SSR bundle
  const pdfjs = await import("pdfjs-dist");
  // Use legacy worker via CDN to keep build simple
  // @ts-ignore
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += text + "\n";
  }
  return fullText.trim();
}
