import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import ApplicationSchema from 'store/schemas/Application';

import propOr from '@misakey/helpers/propOr';

import ListItemApplication from 'components/dumb/ListItem/Application';

import Chip from '@material-ui/core/Chip';

// HELPERS
const blobCountPropOrZero = propOr(0, 'blobCount');

// COMPONENTS
const ListItemApplicationBlobCount = ({
  application, ...rest
}) => {
  const blobCount = useMemo(
    () => blobCountPropOrZero(application),
    [application],
  );

  const hasBlobCount = useMemo(
    () => blobCount > 0,
    [blobCount],
  );

  return (
    <ListItemApplication
      application={application}
      secondaryAction={hasBlobCount ? (
        <Chip color="secondary" label={blobCount} size="small" clickable />
      ) : null}
      {...rest}
    />
  );
};

ListItemApplicationBlobCount.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
};

ListItemApplicationBlobCount.defaultProps = {
  application: null,
};

export default ListItemApplicationBlobCount;
