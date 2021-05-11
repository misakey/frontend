import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/core/helpers/isFunction';

import Chip from '@material-ui/core/Chip';

// COMPONENTS
const ChipFacet = ({ id, onDelete, ...rest }) => {
  const handleDelete = useCallback(
    (event) => {
      onDelete(event, id);
    },
    [id, onDelete],
  );

  const chipProps = useMemo(
    () => (isFunction(onDelete) ? { onDelete: handleDelete } : {}),
    [handleDelete, onDelete],
  );

  return (
    <Chip {...rest} {...chipProps} />
  );
};

ChipFacet.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDelete: PropTypes.func,
};

ChipFacet.defaultProps = {
  onDelete: null,
};

export default ChipFacet;
