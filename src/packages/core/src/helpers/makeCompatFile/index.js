import makeFileOrBlob from '@misakey/core/helpers/makeFileOrBlob';

export default (data, filename, mime, bom) => {
  const blobData = (typeof bom !== 'undefined') ? [bom, data] : [data];
  return makeFileOrBlob(blobData, filename, { type: mime || 'application/octet-stream' });
};
