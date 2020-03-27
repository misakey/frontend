import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ChipUser from 'components/dumb/Chip/User';
import BoxControls from 'components/dumb/Box/Controls';
import List from '@material-ui/core/List';
import ButtonCopy, { MODE } from '@misakey/ui/Button/Copy';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
// CONSTANTS
export const STEP = 'copyPaste';

const ContactConfirmCopyPaste = ({
  contactEmail,
  profile,
  mailto,
  subject,
  body,
  doneTo,
  onDone,
  t,
}) => {
  const theme = useTheme();
  const isXsLayout = useMediaQuery(theme.breakpoints.only('xs'));

  const primary = useMemo(
    () => {
      const linkProps = !isNil(doneTo) ? {
        component: Link,
        to: doneTo,
        replace: true,
      } : {};
      const onClickProps = isFunction(onDone) ? { onClick: onDone } : {};

      return {
        text: t('citizen:contact.confirmation.copyPaste.confirm.button'),
        ...linkProps,
        ...onClickProps,
      };
    },
    [doneTo, onDone, t],
  );

  const mode = useMemo(
    () => (isXsLayout ? MODE.icon : MODE.text),
    [isXsLayout],
  );

  return (
    <>
      <DialogContent>
        <Subtitle>
          {t('citizen:contact.confirmation.copyPaste.subtitle')}
        </Subtitle>
        <Box display="flex" justifyContent="center" mb={1}>
          <ChipUser
            label={contactEmail}
            {...profile}
          />
        </Box>
        <List disablePadding>
          <ListItem
            divider
          >
            <ListItemText
              primary={t('citizen:contact.email.to.label')}
              primaryTypographyProps={{
                variant: 'h6',
                color: 'textSecondary',
              }}
              secondary={mailto}
              secondaryTypographyProps={{
                variant: 'subtitle1',
                color: 'textSecondary',
              }}
            />
            <ListItemSecondaryAction>
              <ButtonCopy value={mailto} mode={mode} />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem
            divider
          >
            <ListItemText
              primary={t('citizen:contact.email.subject.label')}
              primaryTypographyProps={{
                variant: 'h6',
                color: 'textSecondary',
              }}
              secondary={subject}
              secondaryTypographyProps={{
                variant: 'subtitle1',
                color: 'textSecondary',
              }}
            />
            <ListItemSecondaryAction>
              <ButtonCopy value={subject} mode={mode} />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem
            divider
          >
            <ListItemText
              primary={t('citizen:contact.email.body.label')}
              primaryTypographyProps={{
                variant: 'h6',
                color: 'textSecondary',
              }}
              secondary="..."
              secondaryTypographyProps={{
                variant: 'subtitle1',
                color: 'textSecondary',
              }}
            />
            <ListItemSecondaryAction>
              <ButtonCopy value={body} mode={mode} />
            </ListItemSecondaryAction>
          </ListItem>

        </List>
      </DialogContent>
      <DialogActions>
        <BoxControls
          primary={primary}
        />
      </DialogActions>
    </>
  );
};

ContactConfirmCopyPaste.propTypes = {
  contactEmail: PropTypes.string.isRequired,
  mailto: PropTypes.string,
  subject: PropTypes.string,
  body: PropTypes.string,
  doneTo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onDone: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  profile: PropTypes.shape({
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
  }),
};

ContactConfirmCopyPaste.defaultProps = {
  profile: {},
  mailto: null,
  subject: null,
  body: null,
  doneTo: null,
  onDone: null,
};


// CONNECT
const mapStateToProps = (state) => ({
  profile: state.auth.profile,
});

export default connect(mapStateToProps, {})(withTranslation(['citizen', 'common'])(ContactConfirmCopyPaste));
