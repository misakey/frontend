import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';

import getNextSearch from '@misakey/helpers/getNextSearch';

import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ChipUser from 'components/dumb/Chip/User';
import BoxControls from 'components/dumb/Box/Controls';
import { STEP as CP_STEP } from 'components/screens/Citizen/Contact/Confirm/CopyPaste';

// CONSTANTS
export const STEP = 'ensure';

const ContactConfirmEnsure = ({ searchKey, contactEmail, profile, doneTo, t }) => {
  const { pathname, search } = useLocation();

  const primary = useMemo(
    () => ({
      component: Link,
      to: doneTo,
      text: t('common:confirm'),
      replace: true,
    }),
    [doneTo, t],
  );

  const secondary = useMemo(
    () => ({
      component: Link,
      to: {
        pathname,
        search: getNextSearch(search, new Map([
          [searchKey, CP_STEP],
        ])),
      },
      replace: true,
      text: t('citizen:contact.confirmation.ensure.failure.button'),
    }),
    [pathname, search, searchKey, t],
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
  doneTo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  profile: PropTypes.shape({
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
  }),
};

ContactConfirmEnsure.defaultProps = {
  profile: {},
};


// CONNECT
const mapStateToProps = (state) => ({
  profile: state.auth.profile,
});

export default connect(mapStateToProps, {})(withTranslation(['citizen', 'common'])(ContactConfirmEnsure));
