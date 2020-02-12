import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import * as numeral from 'numeral';

import isArray from '@misakey/helpers/isArray';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Chip from '@material-ui/core/Chip';


const ChipDataboxBlobs = ({ blobs, t, ...rest }) => {
  const blobCount = useMemo(
    () => (isArray(blobs) ? blobs.length : (blobs || 0)),
    [blobs],
  );

  const blobSize = useMemo(
    () => {
      if (isArray(blobs) && blobCount > 0) {
        const sum = blobs.reduce((acc, item) => acc + item.contentLength, 0);
        return numeral(sum).format('0b');
      }
      return '';
    },
    [blobs, blobCount],
  );

  const label = useMemo(
    () => `${t('common:databox.blobs.count', { count: blobCount })} ${blobSize}`,
    [blobCount, blobSize, t],
  );

  return <Chip color="secondary" variant="outlined" {...omitTranslationProps(rest)} label={label} />;
};

ChipDataboxBlobs.propTypes = {
  blobs: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.shape({
      contentLength: PropTypes.number,
    }))]),
  t: PropTypes.func.isRequired,
};

ChipDataboxBlobs.defaultProps = {
  blobs: null,
};

export default withTranslation(['common'])(ChipDataboxBlobs);
