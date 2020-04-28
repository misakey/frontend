
import html2canvas from 'html2canvas';

export default (element) => {
  const { scrollHeight: height, scrollWidth: width } = element;
  return html2canvas(element, {
    width,
    height,
    useCORS: true,
    allowTaint: true,
  }).then((canvas) => canvas.toDataURL());
};
