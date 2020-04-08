
import html2canvas from 'html2canvas';

export default (element) => {
  const { scrollHeight: height, scrollWidth: width } = element;

  return html2canvas(element, {
    width,
    height,
    scale: 1,
  }).then((canvas) => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height).data;
    const outputCanvas = document.createElement('canvas');
    const outputContext = outputCanvas.getContext('2d');
    outputCanvas.width = width;
    outputCanvas.height = height;

    const idata = outputContext.createImageData(width, height);
    idata.data.set(imageData);
    outputContext.putImageData(idata, 0, 0);

    return outputCanvas.toDataURL();
  });
};
