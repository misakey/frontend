import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import moment from 'moment';
import numbro from 'numbro';
import { FILE_SIZE_FORMAT } from 'constants/formats/numbers';


import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';


const BlobListItem = ({ blob, onDownload, publicKeysWeCanDecryptFrom, t, datavizEnabled }) => {
  const {
    createdAt,
    contentLength,
    encryption: {
      owner_pub_key: ownerPubKey,
    },
  } = blob;
  const date = moment(createdAt).format('ll');
  const size = numbro(contentLength).format(FILE_SIZE_FORMAT);

  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(ownerPubKey);

  const onClick = useCallback(
    () => onDownload(blob),
    [blob, onDownload],
  );

  return (
    <ListItem>
      <ListItemText
        primary={t('components:blob.fileTypes.unclassified')}
        secondary={t('components:blob.received', { size, date })}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block' }}
      />
      <ListItemSecondaryAction>
        {(canBeDecrypted) ? (
          <Button
            standing={BUTTON_STANDINGS.TEXT}
            text={datavizEnabled ? t('common:view') : t('common:download')}
            onClick={onClick}
          />
        ) : (
          <Button
            disabled
            text={t('common:undecryptable')}
          />
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

BlobListItem.propTypes = {
  blob: PropTypes.object.isRequired,
  onDownload: PropTypes.func.isRequired,
  publicKeysWeCanDecryptFrom: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  datavizEnabled: PropTypes.bool,
};

BlobListItem.defaultProps = {
  datavizEnabled: false,
};


export default withTranslation(['common', 'components'])(BlobListItem);
