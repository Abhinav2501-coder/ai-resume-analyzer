export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

export async function convertPdfToImage(
  file: File,
): Promise<PdfConversionResult> {
  try {
    // 🚨 Prevent SSR crash
    if (typeof window === 'undefined') {
      return {
        imageUrl: '',
        file: null,
        error: 'PDF conversion only works in browser',
      };
    }

    const pdfjsLib = await import('pdfjs-dist');
    const pdfWorker = await import('pdfjs-dist/build/pdf.worker?url');

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return { imageUrl: '', file: null, error: 'No canvas context' };
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext: any = {
      canvasContext: context,
      viewport,
    };

    await page.render(renderContext).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );

    if (!blob) {
      return { imageUrl: '', file: null, error: 'Blob creation failed' };
    }

    const imageFile = new File([blob], file.name.replace(/\.pdf$/i, '.png'), {
      type: 'image/png',
    });

    return {
      imageUrl: URL.createObjectURL(blob),
      file: imageFile,
    };
  } catch (err) {
    console.error(err);
    return {
      imageUrl: '',
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
