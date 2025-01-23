// File handling functions
export async function readResumeFile(file) {
    if (file.type === 'application/pdf') {
        return await readPdfFile(file);
    } else if (file.type === 'text/plain' || file.type === 'application/x-tex') {
        return await readTextFile(file);
    } else if (file.type.includes('word')) {
        return await readDocxFile(file);
    }
    throw new Error('Unsupported file type: ' + file.type);
}

export async function readPdfFile(file) {
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = '../lib/pdf.worker.min.js';

  try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ');
      }

      return text;
  } catch (error) {
      console.error('PDF reading error:', error);
      throw new Error('Failed to read PDF file');
  }
}

export async function readTextFile(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
  });
}

export async function readDocxFile(file) {
  try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
  } catch (error) {
      console.error('DOCX reading error:', error);
      throw new Error('Failed to read DOCX file');
  }
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
}
