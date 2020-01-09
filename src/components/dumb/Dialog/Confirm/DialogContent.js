import React, { isValidElement } from 'react';

import isNil from '@misakey/helpers/isNil';
import isString from '@misakey/helpers/isString';

import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

const ConfirmDialogContent = ({ content }) => {
  if (isValidElement(content) || isNil(content)) {
    return (
      <DialogContent>
        {content}
      </DialogContent>
    );
  }
  if (isString(content)) {
    return (
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{content}</DialogContentText>
      </DialogContent>
    );
  }
  throw new Error('Content is invalid');
};

export default ConfirmDialogContent;
