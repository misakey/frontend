import React, { useState, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Box from '@material-ui/core/Box';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';

import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import SendIcon from '@material-ui/icons/Send';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';
import isEmpty from '@misakey/helpers/isEmpty';

import BoxesSchema from 'store/schemas/Boxes';
import { addBoxEvents } from 'store/reducers/box';

import { MSG_TXT } from 'constants/app/boxes/events';
import encryptText from '@misakey/crypto/box/encryptText';
import { CLOSED } from 'constants/app/boxes/statuses';
import usePublicKeysWeCanDecryptFrom from 'packages/crypto/src/hooks/usePublicKeysWeCanDecryptFrom';
import FooterMenuActions from './Menu';

const BOX_PADDING_SPACING = 1;

const useStyles = makeStyles((theme) => ({
  popper: ({ drawerWidth, isDrawerOpen }) => ({
    width: `calc(100% - ${isDrawerOpen ? drawerWidth : '0px'} - ${theme.spacing(BOX_PADDING_SPACING) * 4}px)`,
  }),
  paper: {
    borderRadius: 10,
  },
}));

function BoxEventsFooter({ box, drawerWidth, isDrawerOpen, onTextareaSizeChange, t }) {
  const classes = useStyles({ drawerWidth, isDrawerOpen });
  const [isMenuActionOpen, setIsMenuActionOpen] = useState(false);
  const [value, setValue] = useState();
  const dispatch = useDispatch();

  const { lifecycle, id, publicKey } = useMemo(() => box || {}, [box]);
  const publicKeysWeCanEncryptWith = usePublicKeysWeCanDecryptFrom();

  const disabled = useMemo(
    () => lifecycle === CLOSED || !publicKeysWeCanEncryptWith.has(publicKey),
    [lifecycle, publicKey, publicKeysWeCanEncryptWith],
  );

  const anchorRef = useRef(null);
  const footerRef = (ref) => {
    if (ref) { onTextareaSizeChange(ref.clientHeight); }
  };

  const onOpen = useCallback(() => {
    setIsMenuActionOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsMenuActionOpen(false);
  }, []);

  const onChange = useCallback((event) => {
    setValue(event.target.value);
  }, []);

  const sendMessage = useCallback(
    () => {
      if (!isEmpty(value)) {
        createBoxEventBuilder(id, {
          type: MSG_TXT,
          content: {
            encrypted: encryptText(value, publicKey),
            recipientPublicKey: publicKey,
          },
        })
          .then((response) => {
            setValue('');
            dispatch(addBoxEvents(id, response));
          });
      }
    },
    [dispatch, id, publicKey, value],
  );

  return (
    <Box p={BOX_PADDING_SPACING} ref={footerRef}>
      <Box ref={anchorRef} display="flex" alignContent="center" alignItems="center">
        {isMenuActionOpen ? (
          <Box width="100%" py={1}>
            <Button text={t('common:cancel')} onClick={onClose} standing={BUTTON_STANDINGS.CANCEL} />
            <Popper
              className={classes.popper}
              open={isMenuActionOpen}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
            >
              {({ TransitionProps }) => (
                <Grow {...TransitionProps} style={{ transformOrigin: 'center top' }}>
                  <Paper variant="outlined" className={classes.paper}>
                    <FooterMenuActions box={box} />
                  </Paper>
                </Grow>
              )}
            </Popper>
          </Box>
        ) : (
          <>
            <Tooltip title={t('boxes:read.actions.more')}>
              <IconButton
                aria-label={t('boxes:read.actions.more')}
                color="secondary"
                onClick={onOpen}
                disabled={disabled}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>

            <TextField
              id="new-message-textarea"
              multiline
              variant="outlined"
              size="small"
              margin="none"
              fullWidth
              value={value}
              onChange={onChange}
              disabled={disabled}
            />
            <Tooltip title={t('boxes:read.actions.send')}>
              <IconButton
                aria-label={t('boxes:read.actions.send')}
                color="secondary"
                onClick={sendMessage}
                disabled={disabled}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );
}

BoxEventsFooter.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  onTextareaSizeChange: PropTypes.func.isRequired,
  // @FIXME BoxesSchema doesn't match props
  // (from https://gitlab.misakey.dev/misakey/frontend/-/merge_requests/413#note_51320)
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxEventsFooter);
