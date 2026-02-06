import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';  // Import pdf-lib components

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);  // For multi-file tools like merge/reorder
  const [selectedFile, setSelectedFile] = useState(null);  // For single-file tools
  const [rotation, setRotation] = useState(90);  // Example for rotate
  const [watermarkText, setWatermarkText] = useState('Confidential');  // Example input

  const handleMultiFileChange = (e) => setSelectedFiles(Array.from(e.target.files));
  const handleSingleFileChange = (e) => setSelectedFile(e.target.files[0]);

  // Helper to download PDF bytes
  const downloadPDF = (bytes, filename) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Merge PDFs
  const mergePDFs = async () => {
    if (selectedFiles.length < 2) return alert('Select at least 2 PDFs');
    const mergedPdf = await PDFDocument.create();
    for (const file of selectedFiles) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }
    const mergedBytes = await mergedPdf.save();
    downloadPDF(mergedBytes, 'merged.pdf');
  };

  // Split PDF (splits into individual pages as separate files)
  const splitPDF = async () => {
    if (!selectedFile) return alert('Select a PDF');
    const bytes = await selectedFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pageCount = pdf.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(page);
      const newBytes = await newPdf.save();
      downloadPDF(newBytes, `split_page_${i + 1}.pdf`);
    }
  };

  // Rotate all pages
  const rotatePDF = async () => {
    if (!selectedFile) return alert('Select a PDF');
    const bytes = await selectedFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    pdf.getPages().forEach((page) => page.setRotation(page.getRotation().angle + rotation));
    const rotatedBytes = await pdf.save();
    downloadPDF(rotatedBytes, 'rotated.pdf');
  };

  // Reorder pages (example: reverse order; add UI for custom order later)
  const reorderPDF = async () => {
    if (!selectedFile) return alert('Select a PDF');
    const bytes = await selectedFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = pdf.getPages().reverse();  // Simple reverse; customize as needed
    pdf.removePage(0);  // Reset and re-add in new order
    pages.forEach((page) => pdf.addPage(page));
    const reorderedBytes = await pdf.save();
    downloadPDF(reorderedBytes, 'reordered.pdf');
  };

  // Add page numbers
  const addPageNumbers = async () => {
    if (!selectedFile) return alert('Select a PDF');
    const bytes = await selectedFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
    const pages = pdf.getPages();
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      page.drawText(`Page ${index + 1}`, {
        x: width / 2 - 20,
        y: 10,
        size: 12,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
    });
    const numberedBytes = await pdf.save();
    downloadPDF(numberedBytes, 'numbered.pdf');
  };

  // Add watermark
  const addWatermark = async () => {
    if (!selectedFile) return alert('Select a PDF');
    const bytes = await selectedFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
    const pages = pdf.getPages();
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 4,
        y: height / 2,
        size: 50,
        font: helvetica,
        color: rgb(0.75, 0.75, 0.75),
        opacity: 0.5,
        rotate: { type: 'degrees', angle: 45 },
      });
    });
    const watermarkedBytes = await pdf.save();
    downloadPDF(watermarkedBytes, 'watermarked.pdf');
  };

  // Basic compress (remove duplicates, optimize; not advanced)
  const compressPDF = async () => {
    if (!selectedFile) return alert('Select a PDF');
    const bytes = await selectedFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    // Basic: Save with compression (pdf-lib has built-in options; for more, add @pdf-lib/upng or similar)
    const compressedBytes = await pdf.save({ useObjectStreams: true });
    downloadPDF(compressedBytes, 'compressed.pdf');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Paperforge: Offline PDF Editor</h1>
      <p>All tools run locally in your browser—no internet needed.</p>

      {/* Merge */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Merge PDFs</h2>
        <input type="file" multiple accept=".pdf" onChange={handleMultiFileChange} />
        <button onClick={mergePDFs}>Merge</button>
      </section>

      {/* Split */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Split PDF</h2>
        <input type="file" accept=".pdf" onChange={handleSingleFileChange} />
        <button onClick={splitPDF}>Split into Pages</button>
      </section>

      {/* Rotate */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Rotate PDF</h2>
        <input type="file" accept=".pdf" onChange={handleSingleFileChange} />
        <select value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))}>
          <option value="90">90°</option>
          <option value="180">180°</option>
          <option value="270">270°</option>
        </select>
        <button onClick={rotatePDF}>Rotate</button>
      </section>

      {/* Reorder (basic reverse; add drag-drop UI for advanced) */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Reorder Pages (Reverse)</h2>
        <input type="file" accept=".pdf" onChange={handleSingleFileChange} />
        <button onClick={reorderPDF}>Reorder</button>
      </section>

      {/* Page Numbers */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Add Page Numbers</h2>
        <input type="file" accept=".pdf" onChange={handleSingleFileChange} />
        <button onClick={addPageNumbers}>Add Numbers</button>
      </section>

      {/* Watermark */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Add Watermark</h2>
        <input type="file" accept=".pdf" onChange={handleSingleFileChange} />
        <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Watermark text" />
        <button onClick={addWatermark}>Add Watermark</button>
      </section>

      {/* Compress */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Compress PDF (Basic)</h2>
        <input type="file" accept=".pdf" onChange={handleSingleFileChange} />
        <button onClick={compressPDF}>Compress</button>
      </section>
    </div>
  );
}

export default App;
