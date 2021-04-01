import { useMemo } from 'react';
import isNil from '@misakey/core/helpers/isNil';

import DefaultIcon from '@material-ui/icons/InsertDriveFile';
import ImageIcon from '@material-ui/icons/Image';
import VideoIcon from '@material-ui/icons/Videocam';
import PdfIcon from '@material-ui/icons/PictureAsPdf';
import BrokenImageIcon from '@material-ui/icons/BrokenImage';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

export default (fileType, broken = false) => useMemo(() => {
  if (isNil(fileType)) {
    return broken ? ReportProblemIcon : DefaultIcon;
  }
  if (fileType.startsWith('image')) {
    return broken ? BrokenImageIcon : ImageIcon;
  }
  if (broken) { return ReportProblemIcon; }
  if (fileType === 'application/pdf') { return PdfIcon; }
  if (fileType.startsWith('video')) { return VideoIcon; }
  if (fileType.startsWith('audio')) { return VolumeUpIcon; }
  return DefaultIcon;
}, [broken, fileType]);
