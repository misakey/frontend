import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';
import routes from 'routes';

import { USER_REQUEST_STATUS } from 'constants/search/request/params';
import { DRAFT } from 'constants/databox/status';
import ApplicationSchema from 'store/schemas/Application';

import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import getNextSearch from '@misakey/helpers/getNextSearch';


import IconButtonWithRequestCreation from 'components/smart/Requests/New/with/IconButton';
import ListItemApplication from 'components/dumb/ListItem/Application';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import SnackbarActionSee from 'components/dumb/Snackbar/Action/See';

import AddIcon from '@material-ui/icons/Add';

// COMPONENTS
const ListItemApplicationQuickDraft = ({
  isAuthenticated, application, t, ...rest
}) => {
  const { pathname, search } = useLocation();

  const { enqueueSnackbar } = useSnackbar();

  const redirectProps = useMemo(
    () => ({
      to: { pathname, search },
    }),
    [pathname, search],
  );

  const draftsTo = useMemo(
    () => ({
      pathname: routes.citizen._,
      search: getNextSearch(search, new Map([
        [USER_REQUEST_STATUS, DRAFT],
      ])),
    }),
    [search],
  );

  const onDraftSuccess = useCallback(
    () => {
      enqueueSnackbar(t('common:quickDraft.success'), { variant: 'success', action: (key) => <SnackbarActionSee id={key} to={draftsTo} /> });
    },
    [draftsTo, enqueueSnackbar, t],
  );

  const { id, dpoEmail } = useMemo(
    () => application || {},
    [application],
  );

  const hasQuickDraft = useMemo(
    () => (!isEmpty(dpoEmail) || !isAuthenticated),
    [dpoEmail, isAuthenticated],
  );

  return (
    <ListItemApplication
      application={application}
      secondaryAction={hasQuickDraft ? (
        <ListItemSecondaryAction>
          <IconButtonWithRequestCreation
            color="secondary"
            edge="end"
            aria-label={t('common:send')}
            producerId={id}
            onSuccess={onDraftSuccess}
            redirectProps={redirectProps}
          >
            <AddIcon />
          </IconButtonWithRequestCreation>
        </ListItemSecondaryAction>
      ) : null}
      {...omitTranslationProps(rest)}
    />
  );
};

ListItemApplicationQuickDraft.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  t: PropTypes.func.isRequired,
  // CONNECT
  isAuthenticated: PropTypes.bool,
};

ListItemApplicationQuickDraft.defaultProps = {
  application: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

export default connect(mapStateToProps, {})(withTranslation('common')(ListItemApplicationQuickDraft));
