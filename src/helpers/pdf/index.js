import * as pdfjs from 'pdfjs-dist/build/pdf';
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker';

pdfjs.GlobalWorkerOptions.workerPort = new PdfjsWorker();

export const getDocument = (pdfFile) => pdfjs.getDocument(pdfFile).promise;

export const getPage = async (page, pdfDoc, canvas) => {
  const pdfPage = await pdfDoc.getPage(page);
  const viewport = pdfPage.getViewport({ scale: 1.0 });
  canvas.width = viewport.width; // eslint-disable-line no-param-reassign
  canvas.height = viewport.height; // eslint-disable-line no-param-reassign
  const canvasContext = canvas.getContext('2d');

  const { promise } = pdfPage.render({
    canvasContext,
    viewport,
  });
  return promise;
};

export default async (pdfFile, canvas) => {
  const pdfDoc = await getDocument(pdfFile);
  const task = getPage(pdfDoc, canvas);
  return {
    pdfDoc,
    task,
  };
};
