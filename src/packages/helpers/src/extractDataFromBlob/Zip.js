
import JSZip from 'jszip';

export default (blob, setData) => {
  JSZip.loadAsync(blob)
    .then((zip) => {
      zip.forEach((relativePath, zipEntry) => {
        // @FIXME: for now it's specific to trainline.fr data structure, so with only one file in
        // the zip. We should update it when next dataviz implementation
        if (relativePath.endsWith('.json')) {
          zipEntry.async('text').then((str) => {
            setData(JSON.parse(str));
          });
        }
      });
    });
};
