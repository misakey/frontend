import { useMemo } from 'react';
import isNil from '@misakey/helpers/isNil';

import DefaultIcon from '@material-ui/icons/InsertDriveFile';
import ImageIcon from '@material-ui/icons/Image';
import VideoIcon from '@material-ui/icons/Videocam';
import PdfIcon from '@material-ui/icons/PictureAsPdf';

export default (fileType) => useMemo(() => {
  if (isNil(fileType)) { return DefaultIcon; }
  if (fileType === 'application/pdf') { return PdfIcon; }
  if (fileType.startsWith('image')) { return ImageIcon; }
  if (fileType.startsWith('video')) { return VideoIcon; }
  return DefaultIcon;
}, [fileType]);
