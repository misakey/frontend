import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';

import { updateMailer } from 'store/actions/devicePreferences';


import getNextSearch from '@misakey/helpers/getNextSearch';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ChipUser from 'components/dumb/Chip/User';
import BoxControls from 'components/dumb/Box/Controls';
import { STEP as CP_STEP } from 'components/screens/Citizen/Contact/Confirm/CopyPaste';

// CONSTANTS
export const STEP = 'ensure';

const ContactConfirmEnsure = ({
  searchKey, contactEmail, profile, doneTo, onDone, t, dispatchUpdateMailer,
}) => {
  const { pathname, search } = useLocation();

  const setMailerToCopyPaste = useCallback(
    () => dispatchUpdateMailer('copyPaste'),
    [dispatchUpdateMailer],
  );

  const onConfirm = useCallback(
    (e) => {
      dispatchUpdateMailer('mailto');
      if (isFunction(onDone)) {
        return onDone(e);
      }
      return null;
    },
    [onDone, dispatchUpdateMailer],
  );

  // @FIXME factorize the bahavior with ContactConfirmCopyPaste
  const primary = useMemo(
    () => {
      const linkProps = !isNil(doneTo) ? {
        component: Link,
        to: doneTo,
        replace: true,
      } : {};

      return {
        text: t('common:confirm'),
        ...linkProps,
        onClick: onConfirm,
      };
    },
    [doneTo, onConfirm, t],
  );

  const secondary = useMemo(
    () => ({
      component: Link,
      onClick: setMailerToCopyPaste,
      to: {
        pathname,
        search: getNextSearch(search, new Map([
          [searchKey, CP_STEP],
        ])),
      },
      replace: true,
      text: t('citizen:contact.confirmation.ensure.failure.button'),
    }),
    [pathname, search, searchKey, t, setMailerToCopyPaste],
  );

  return (
    <>
      <DialogContent>
        <Subtitle>
          {t('citizen:contact.confirmation.ensure.subtitle')}
        </Subtitle>
        <Box display="flex" justifyContent="center" mb={1}>
          <ChipUser
            label={contactEmail}
            {...profile}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <BoxControls
          primary={primary}
          secondary={secondary}
        />
      </DialogActions>
    </>
  );
};

ContactConfirmEnsure.propTypes = {
  searchKey: PropTypes.string.isRequired,
  contactEmail: PropTypes.string.isRequired,
  doneTo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onDone: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  profile: PropTypes.shape({
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
  }),
  dispatchUpdateMailer: PropTypes.func.isRequired,
};

ContactConfirmEnsure.defaultProps = {
  profile: {},
  onDone: null,
  doneTo: null,
};


// CONNECT
const mapStateToProps = (state) => ({
  profile: state.auth.profile,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateMailer: (mailer) => dispatch(updateMailer(mailer)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['citizen', 'common'])(ContactConfirmEnsure));
