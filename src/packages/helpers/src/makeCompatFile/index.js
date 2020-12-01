import makeFileOrBlob from '@misakey/helpers/makeFileOrBlob';

export default (data, filename, mime, bom) => {
  const blobData = (typeof bom !== 'undefined') ? [bom, data] : [data];
  return makeFileOrBlob(blobData, filename, { type: mime || 'application/octet-stream' });
};
