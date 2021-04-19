import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import noop from '@misakey/core/helpers/noop';
import isFunction from '@misakey/core/helpers/isFunction';

import Link from '@material-ui/core/Link';
import DialogConfirm from '@misakey/ui/Dialog/Confirm';

// COMPONENTS
const LinkFeedback = ({ text, details, onClick, ...rest }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = useCallback(
    (e) => {
      setIsDialogOpen(true);
      if (isFunction(onClick)) {
        onClick(e);
      }
    },
    [setIsDialogOpen, onClick],
  );

  const onClose = useCallback(
    () => {
      setIsDialogOpen(false);
    },
    [setIsDialogOpen],
  );

  return (
    <>
      <Link
        component="button"
        onClick={handleClick}
        {...rest}
      >
        {text}
      </Link>
      <DialogConfirm
        open={isDialogOpen}
        onClose={onClose}
        onConfirm={noop}
        title={text}
      >
        {details}
      </DialogConfirm>
    </>
  );
};

LinkFeedback.propTypes = {
  text: PropTypes.string.isRequired,
  details: PropTypes.node,
  onClick: PropTypes.func,
};

LinkFeedback.defaultProps = {
  onClick: null,
  details: null,
};

export default LinkFeedback;
