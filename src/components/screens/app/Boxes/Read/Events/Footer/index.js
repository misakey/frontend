import React, { useState, useCallback, useRef } from 'react';
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

// @FIXME crypto
const encrypt = (value) => btoa(value);

function BoxEventsFooter({ box, drawerWidth, isDrawerOpen, onTextareaSizeChange, t }) {
  const classes = useStyles({ drawerWidth, isDrawerOpen });
  const [isMenuActionOpen, setIsMenuActionOpen] = useState(false);
  const [value, setValue] = React.useState();
  const dispatch = useDispatch();

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
        createBoxEventBuilder(box.id, { type: MSG_TXT, content: { encrypted: encrypt(value) } })
          .then((response) => {
            setValue('');
            dispatch(addBoxEvents(box.id, response));
          });
      }
    },
    [box.id, dispatch, value],
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
              <IconButton aria-label="menu-list-actions" color="secondary" onClick={onOpen}>
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
            />
            <Tooltip title={t('boxes:read.actions.send')}>
              <IconButton aria-label="menu-list-actions" color="secondary" onClick={sendMessage}>
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
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxEventsFooter);
