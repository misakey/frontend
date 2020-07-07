import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import Box from '@material-ui/core/Box';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';

import Formik from '@misakey/ui/Formik';
import { Form } from 'formik';
import FormField from '@misakey/ui/Form/Field';
import FieldTextMultiline from 'components/dumb/Form/Field/Text/Multiline';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import SendIcon from '@material-ui/icons/Send';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';

import BoxesSchema from 'store/schemas/Boxes';
import { boxMessageValidationSchema } from 'constants/validationSchemas/boxes';
import { addBoxEvents } from 'store/reducers/box';
import { removeEntities } from '@misakey/store/actions/entities';

import { MSG_TXT } from 'constants/app/boxes/events';
import encryptText from '@misakey/crypto/box/encryptText';
import { CLOSED } from 'constants/app/boxes/statuses';
import usePublicKeysWeCanDecryptFrom from 'packages/crypto/src/hooks/usePublicKeysWeCanDecryptFrom';
import errorTypes from '@misakey/ui/constants/errorTypes';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import FooterMenuActions from './Menu';

// CONSTANTS
const FIELD = 'message';
const { conflict } = errorTypes;
const BOX_PADDING_SPACING = 1;

const INITIAL_VALUES = {
  [FIELD]: '',
};

const useStyles = makeStyles((theme) => ({
  popper: ({ drawerWidth, isDrawerOpen }) => ({
    width: `calc(100% - ${isDrawerOpen ? drawerWidth : '0px'} - ${theme.spacing(BOX_PADDING_SPACING) * 4}px)`,
  }),
  paper: {
    borderRadius: 10,
  },
  textField: {
    alignSelf: 'center',
  },
}));

function BoxEventsFooter({ box, drawerWidth, isDrawerOpen, t }) {
  const classes = useStyles({ drawerWidth, isDrawerOpen });
  const [isMenuActionOpen, setIsMenuActionOpen] = useState(false);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const { lifecycle, id, publicKey } = useMemo(() => box || {}, [box]);
  const publicKeysWeCanEncryptWith = usePublicKeysWeCanDecryptFrom();

  const disabled = useMemo(
    () => lifecycle === CLOSED || !publicKeysWeCanEncryptWith.has(publicKey),
    [lifecycle, publicKey, publicKeysWeCanEncryptWith],
  );

  const anchorRef = useRef(null);

  const onOpen = useCallback(() => {
    setIsMenuActionOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsMenuActionOpen(false);
  }, []);

  const handleSubmit = useCallback(
    ({ [FIELD]: value }, { setSubmitting, resetForm }) => {
      resetForm();
      return createBoxEventBuilder(id, {
        type: MSG_TXT,
        content: {
          encrypted: encryptText(value, publicKey),
          publicKey,
        },
      })
        .then((response) => {
          dispatch(addBoxEvents(id, response));
        })
        .catch((error) => {
          if (error.code === conflict) {
            const { details = {} } = error;
            if (details.lifecycle === conflict) {
              dispatch(removeEntities([{ id }], BoxesSchema));
              enqueueSnackbar(t('boxes:read.events.create.error.lifecycle'), { variant: 'error' });
            }
          } else {
            handleHttpErrors(error);
          }
        })
        .finally(() => { setSubmitting(false); });
    },
    [dispatch, enqueueSnackbar, handleHttpErrors, id, publicKey, t],
  );

  useEffect(() => {
    // Reset to initialState when box changes
    setIsMenuActionOpen(false);
  }, [id]);

  return (
    <Box p={BOX_PADDING_SPACING}>
      <Box ref={anchorRef} display="flex" alignContent="center" alignItems="flex-end">
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
                    <FooterMenuActions box={box} onCloseMenuActions={onClose} />
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
            <Formik
              initialValues={INITIAL_VALUES}
              onSubmit={handleSubmit}
              validationSchema={boxMessageValidationSchema}
            >
              <Box component={Form} display="flex" flexGrow="1" alignItems="flex-end">
                <FormField
                  component={FieldTextMultiline}
                  name={FIELD}
                  className={classes.textField}
                  id="new-message-textarea"
                  variant="outlined"
                  size="small"
                  margin="none"
                  fullWidth
                  rowsMax={8}
                  displayError={false}
                  disabled={disabled}
                />
                <Tooltip title={t('boxes:read.actions.send')}>
                  <IconButton
                    type="submit"
                    aria-label={t('boxes:read.actions.send')}
                    color="secondary"
                    disabled={disabled}
                  >
                    <SendIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Formik>
          </>
        )}
      </Box>
    </Box>
  );
}

BoxEventsFooter.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  // @FIXME BoxesSchema doesn't match props
  // (from https://gitlab.misakey.dev/misakey/frontend/-/merge_requests/413#note_51320)
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxEventsFooter);
