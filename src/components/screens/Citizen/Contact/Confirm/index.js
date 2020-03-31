import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useLocation, useHistory, useRouteMatch } from 'react-router-dom';

import getSearchParams from '@misakey/helpers/getSearchParams';
import getNextSearch from '@misakey/helpers/getNextSearch';
import objectValuesToSearchParams from 'helpers/objectValuesToSearchParams';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Dialog from '@material-ui/core/Dialog';
import Navigation from 'components/dumb/AppBar/Navigation';
import RouteSearch from 'components/smart/Route/Search';
import ContactConfirmEnsure, { STEP as ENSURE_STEP } from 'components/screens/Citizen/Contact/Confirm/Ensure';
import ContactConfirmCopyPaste, { STEP as CP_STEP } from 'components/screens/Citizen/Contact/Confirm/CopyPaste';

// CONSTANTS
const MODAL_STEPS = {
  ensure: ENSURE_STEP,
  copyPaste: CP_STEP,
};

const PREVIOUS_STEP = {
  [MODAL_STEPS.ensure]: undefined,
  [MODAL_STEPS.copyPaste]: MODAL_STEPS.ensure,
};

// COMPONENTS
const ContactConfirm = ({ searchKey, t, ...rest }) => {
  const { path } = useRouteMatch();
  const { pathname, search } = useLocation();
  const { replace } = useHistory();

  const searchKeySearchParam = useMemo(
    () => getSearchParams(search)[searchKey],
    [search, searchKey],
  );

  const navigationTitle = useMemo(
    () => t(`citizen:contact.confirmation.${searchKeySearchParam}.title`),
    [searchKeySearchParam, t],
  );

  const navigationHomePath = useMemo(
    () => {
      const nextSearchValue = PREVIOUS_STEP[searchKeySearchParam];
      return {
        pathname,
        search: getNextSearch(search, new Map([
          [searchKey, nextSearchValue],
        ])),
      };
    },
    [pathname, search, searchKey, searchKeySearchParam],
  );

  const searchParamsByStep = useMemo(
    () => objectValuesToSearchParams(MODAL_STEPS, searchKey),
    [searchKey],
  );

  const onClose = useCallback(
    () => {
      replace({
        pathname,
        search: getNextSearch(search, new Map([
          [searchKey, undefined],
        ])),
      });
    },
    [pathname, replace, search, searchKey],
  );

  if (isNil(searchKeySearchParam)) {
    return null;
  }

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <Navigation
        title={navigationTitle}
        homePath={navigationHomePath}
        gutterBottom={false}
        replace
      />
      <RouteSearch
        path={path}
        exact
        searchParams={searchParamsByStep[MODAL_STEPS.ensure]}
        render={(routerProps) => (
          <ContactConfirmEnsure
            searchKey={searchKey}
            {...omitTranslationProps(rest)}
            {...routerProps}
          />
        )}
      />
      <RouteSearch
        path={path}
        exact
        searchParams={searchParamsByStep[MODAL_STEPS.copyPaste]}
        render={(routerProps) => (
          <ContactConfirmCopyPaste
            searchKey={searchKey}
            {...omitTranslationProps(rest)}
            {...routerProps}
          />
        )}
      />
    </Dialog>
  );
};

ContactConfirm.propTypes = {
  searchKey: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('citizen')(ContactConfirm);
