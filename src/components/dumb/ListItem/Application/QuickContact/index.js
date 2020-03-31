import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import ApplicationSchema from 'store/schemas/Application';

import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import IconButtonWithRequestCreation from 'components/smart/Requests/New/with/IconButton';
import ListItemApplication from 'components/dumb/ListItem/Application';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import MailOutlineIcon from '@material-ui/icons/MailOutline';

// HELPERS

// COMPONENTS
const ListItemApplicationQuickContact = ({
  isAuthenticated, application, t, ...rest
}) => {
  const { id, dpoEmail } = useMemo(
    () => application || {},
    [application],
  );

  const hasQuickContact = useMemo(
    () => (!isEmpty(dpoEmail) || !isAuthenticated),
    [dpoEmail, isAuthenticated],
  );

  return (
    <ListItemApplication
      application={application}
      secondaryAction={hasQuickContact ? (
        <ListItemSecondaryAction>
          <IconButtonWithRequestCreation
            color="secondary"
            edge="end"
            aria-label={t('common:send')}
            producerId={id}
          >
            <MailOutlineIcon />
          </IconButtonWithRequestCreation>
        </ListItemSecondaryAction>
      ) : null}
      {...omitTranslationProps(rest)}
    />
  );
};

ListItemApplicationQuickContact.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  t: PropTypes.func.isRequired,
  // CONNECT
  isAuthenticated: PropTypes.bool,
};

ListItemApplicationQuickContact.defaultProps = {
  application: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

export default connect(mapStateToProps, {})(withTranslation('common')(ListItemApplicationQuickContact));
