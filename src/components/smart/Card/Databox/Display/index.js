import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import List from '@material-ui/core/List';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import FolderIcon from '@material-ui/icons/Folder';

import includes from '@misakey/helpers/includes';

import moment from 'moment';
import * as numeral from 'numeral';

const DataboxDisplay = ({
  blobs, t, downloadBlob,
  publicKeysWeCanDecryptFrom,
  isCryptoReadyToDecrypt,
}) => (
  <List disablePadding>
    {
          // "sort" method mutates the array
          // so we have to copy it with the "concat"
          // see https://stackoverflow.com/a/43572944/3025740
          [].concat(blobs)
            // we want most recent first
            .sort((blob1, blob2) => blob1.createdAt < blob2.createdAt)
            .map((blob) => {
              const {
                createdAt,
                contentLength,
                id,
                encryption: {
                  owner_pub_key: ownerPubKey,
                },
              } = blob;
              const date = moment(createdAt).format('LLLL');
              const size = numeral(contentLength).format('0a') + t('units.bytes');
              const canBeDecrypted = includes(publicKeysWeCanDecryptFrom, ownerPubKey);
              return (
                <ListItem key={id} disableGutters>
                  <ListItemAvatar>
                    <Avatar>
                      <FolderIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={t('screens:databox.sendAt', { date })}
                    secondary={(
                      <>
                        <span>{t('screens:databox.size', { size })}</span>
                        {(!isCryptoReadyToDecrypt || !canBeDecrypted) && (
                          <>
                            <Box component="span" mx={1}> &ndash; </Box>
                            <span>
                              {
                                (!isCryptoReadyToDecrypt)
                                  ? t('screens:application.box.mustUnlockVault')
                                  : t('screens:databox.errors.missingSecretKey')
                              }
                            </span>
                          </>
                        )}
                      </>
                    )}
                  />
                  <ListItemSecondaryAction>
                    {(canBeDecrypted) && (
                      <IconButton
                        edge="end"
                        aria-label="Download"
                        onClick={() => downloadBlob(blob)}
                      >
                        <CloudDownloadIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
        }
  </List>
);

DataboxDisplay.propTypes = {
  blobs: PropTypes.arrayOf(PropTypes.object).isRequired,
  t: PropTypes.func.isRequired,
  downloadBlob: PropTypes.func.isRequired,
  publicKeysWeCanDecryptFrom: PropTypes.arrayOf(PropTypes.string).isRequired,
  isCryptoReadyToDecrypt: PropTypes.bool.isRequired,
};

export default withTranslation(['common', 'screens'])(DataboxDisplay);
