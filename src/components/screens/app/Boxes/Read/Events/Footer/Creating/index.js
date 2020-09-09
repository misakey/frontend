import React, { useCallback, useRef, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import errorTypes from '@misakey/ui/constants/errorTypes';
import { MSG_TXT } from 'constants/app/boxes/events';
import encryptText from '@misakey/crypto/box/encryptText';
import { CLOSED } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';
import { boxMessageValidationSchema } from 'constants/validationSchemas/boxes';
import { removeEntities } from '@misakey/store/actions/entities';

import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useBoxPublicKeysWeCanDecryptFrom from 'packages/crypto/src/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { usePaginateEventsContext } from 'components/smart/Context/PaginateEventsByBox';

import FooterMenuList from 'components/screens/app/Boxes/Read/Events/Footer/MenuList';
import Box from '@material-ui/core/Box';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Formik from '@misakey/ui/Formik';
import { Form } from 'formik';
import FormField from '@misakey/ui/Form/Field';
import FieldTextMultiline from 'components/dumb/Form/Field/Text/Multiline';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import IconButtonSubmit from '@misakey/ui/IconButton/Submit';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ResetOnBoxChange from 'components/screens/app/Boxes/Read/Events/Footer/Creating/ResetOnBoxChange';

import AddIcon from '@material-ui/icons/Add';
import SendIcon from '@material-ui/icons/Send';

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
  textFieldRoot: {
    alignSelf: 'center',
  },
  textFieldInputRoot: {
    minHeight: 48,
  },
}));

// COMPONENTS
function BoxEventsFooter({ box, drawerWidth, isDrawerOpen, isMenuActionOpen, onOpen, onClose, t }) {
  const classes = useStyles({ drawerWidth, isDrawerOpen });
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const { addItems } = usePaginateEventsContext();

  const { lifecycle, id, publicKey, title } = useMemo(() => box || {}, [box]);
  const publicKeysWeCanEncryptWith = useBoxPublicKeysWeCanDecryptFrom();

  const disabled = useMemo(
    () => lifecycle === CLOSED || !publicKeysWeCanEncryptWith.has(publicKey),
    [lifecycle, publicKey, publicKeysWeCanEncryptWith],
  );

  const anchorRef = useRef(null);

  const handleSubmit = useCallback(
    ({ [FIELD]: value }, { setSubmitting, resetForm }) => createBoxEventBuilder(id, {
      type: MSG_TXT,
      content: {
        encrypted: encryptText(value, publicKey),
        publicKey,
      },
    })
      .then((response) => {
        addItems([response]);
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
      .finally(() => {
        setSubmitting(false);
        resetForm();
      }),
    [addItems, dispatch, enqueueSnackbar, handleHttpErrors, id, publicKey, t],
  );

  useEffect(() => {
    // Reset to initialState when box changes
    onClose();
  }, [id, onClose]);

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
                    <FooterMenuList box={box} />
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
                <ResetOnBoxChange box={box} />
                <FormField
                  component={FieldTextMultiline}
                  name={FIELD}
                  className={classes.textFieldRoot}
                  InputProps={{ classes: { root: classes.textFieldInputRoot } }}
                  id="new-message-textarea"
                  variant="outlined"
                  placeholder={t('boxes:read.actions.write', { title })}
                  aria-label={t('boxesread.actions.write', { title })}
                  size="small"
                  margin="none"
                  fullWidth
                  rowsMax={8}
                  displayError={false}
                  disabled={disabled}
                />
                <Tooltip title={t('boxes:read.actions.send')}>
                  <IconButtonSubmit
                    aria-label={t('boxes:read.actions.send')}
                    color="secondary"
                    disabled={disabled}
                  >
                    <SendIcon />
                  </IconButtonSubmit>
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
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // menu actions
  isMenuActionOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxEventsFooter);
