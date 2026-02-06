import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

function App() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => setFiles(e.target.files);

  const mergePDFs = async () => {
    if (!files.length) return alert('Select PDFs');
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
    }
    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'merged.pdf';
    link.click();
  };

  return (
    <>
      <h1>Paperforge</h1>
      <p>Welcome! Your app is working!</p>
      <input type="file" multiple accept="application/pdf" onChange={handleFileChange} />
      <button onClick={mergePDFs}>Merge PDFs</button>
    </>
  );
}

export default App;
