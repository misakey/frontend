import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import { generatePath, Link, Redirect, useLocation, useHistory } from 'react-router-dom';

import { IS_PLUGIN } from 'constants/plugin';
import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';
import UserEmailSchema from 'store/schemas/UserEmail';
import { LEGAL_RECONTACT, CORDIAL_RECONTACT, FRIENDLY_RECONTACT } from 'constants/mailTypes/recontact';
import { LEGAL, CORDIAL, FRIENDLY } from 'constants/mailTypes';

import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import getSearchParams from '@misakey/helpers/getSearchParams';
import getNextSearch from '@misakey/helpers/getNextSearch';
import mapDates from '@misakey/helpers/mapDates';
import propEq from '@misakey/helpers/propEq';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';
import encodeMailto from 'helpers/encodeMailto';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useMailtoProps from 'hooks/useMailtoProps';

import withDataboxURL from 'components/smart/withDataboxURL';
import Container from '@material-ui/core/Container';
import ExpansionPanelContactFrom from 'components/smart/ExpansionPanel/Contact/From';
import CardContactTo from 'components/dumb/Card/Contact/To';
import CardContactSubject from 'components/smart/Card/Contact/Subject';
import CardContactBody from 'components/dumb/Card/Contact/Body';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import { SCREEN_STATE_PROPTYPES, getStyleForContainerScroll } from 'components/dumb/Screen';
import ScreenAction from 'components/dumb/Screen/Action';
import ContactConfig from 'components/screens/Citizen/Contact/Config';
import ContactConfirm from 'components/screens/Citizen/Contact/Confirm';

import AddIcon from '@material-ui/icons/Add';

// @DEPRECIATED: replaced by new request view

// CONSTANTS
const NAV_BAR_HEIGHT = 57;
const CONFIG_KEY = 'config';
const CONFIRM_KEY = 'confirm';

// HELPERS
const databoxHasProducerId = propEq('producerId');
const isUserEmailActive = propEq('active', true);
const getOwnerEmail = path(['owner', 'email']);
const hasMissingOwner = compose(
  isNil,
  prop('owner'),
);

// HOOKS
const useStyles = makeStyles((theme) => ({
  spanNoWrap: {
    whiteSpace: 'nowrap',
  },
  container: {
    ...getStyleForContainerScroll(theme, NAV_BAR_HEIGHT),
    padding: theme.spacing(2),
  },
}));

// COMPONENTS
const ContactPreview = ({
  databoxURL,
  databox,
  entity,
  userEmails,
  userId,
  contactEmail,
  isNewDatabox,
  isFetchingDatabox,
  screenProps,
  t,
}) => {
  const classes = useStyles();

  const { search, pathname, ...locationRest } = useLocation();
  const { replace } = useHistory();

  const searchParams = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const recontact = useMemo(
    () => searchParams.recontact,
    [searchParams],
  );

  const options = useMemo(
    () => (userEmails || []).filter(isUserEmailActive),
    [userEmails],
  );

  const mailType = useMemo(
    () => searchParams.mailType,
    [searchParams],
  );

  const { dpoEmail, mainDomain, name, id } = useMemo(
    () => (isNil(entity) ? {} : entity),
    [entity],
  );

  // when switching applications on contact screen,
  // make sure databox matches current application
  const applicationIdMatchesDatabox = useMemo(
    () => !isNil(databox) && databoxHasProducerId(id, databox),
    [databox, id],
  );

  // if we have searchParams recontact defined we don't need to check isNewDatabox
  // and we can have isNewDatabox to null
  const isLoading = useMemo(
    () => (isNil(recontact) && isNil(isNewDatabox)) || !applicationIdMatchesDatabox,
    [recontact, isNewDatabox, applicationIdMatchesDatabox],
  );

  const screenPropsWithDataboxURL = useMemo(
    () => ({
      ...screenProps,
      state: {
        ...screenProps.state,
        isFetching: screenProps.state.isFetching || isFetchingDatabox || isLoading,
      },
    }),
    [screenProps, isFetchingDatabox, isLoading],
  );

  const exitRecontact = useMemo(
    () => {
      let newMailType;
      switch (mailType) {
        case LEGAL_RECONTACT:
          newMailType = LEGAL;
          break;
        case FRIENDLY_RECONTACT:
          newMailType = FRIENDLY;
          break;
        case CORDIAL_RECONTACT:
          newMailType = CORDIAL;
          break;
        default:
          return null;
      }

      return {
        pathname,
        search: getNextSearch(search, new Map([
          ['recontact', false],
          ['reopen', undefined],
          ['mailType', newMailType],
        ])),
      };
    },
    [search, pathname, mailType],
  );

  const subject = useMemo(
    () => t('citizen:contact.email.subject.value'),
    [t],
  );

  const body = useMemo(
    () => t(`citizen:contact.email.body.${mailType}`, { dpoEmail, databoxURL, mainDomain, ...mapDates(databox) }),
    [databoxURL, databox, mainDomain, dpoEmail, mailType, t],
  );

  const initialEmail = useMemo(
    () => {
      const ownerEmail = getOwnerEmail(databox);
      // on a new databox, propose last used email to contact as initial email
      // fallback on ownerEmail if no contactEmail in store
      if (isNewDatabox) {
        return contactEmail || ownerEmail;
      }
      // on an already existing databox, propose email linked to databox
      return ownerEmail;
    },
    [contactEmail, databox, isNewDatabox],
  );

  const doneTo = useMemo(
    () => generatePath(routes.citizen.application.vault, { mainDomain }),
    [mainDomain],
  );

  const navigationProps = useMemo(
    () => ({
      homePath: doneTo,
      toolbarProps: { maxWidth: 'md' },
      gutterBottom: !IS_PLUGIN,
    }),
    [doneTo],
  );

  const mailto = useMemo(
    () => encodeMailto(dpoEmail, subject, body),
    [dpoEmail, subject, body],
  );

  const onClick = useCallback(
    () => {
      replace({
        pathname,
        search: getNextSearch(search, new Map([
          [CONFIRM_KEY, 'ensure'],
        ])),
      });
    },
    [pathname, replace, search],
  );

  const mailtoProps = useMailtoProps(mailto, onClick);

  const redirectTo = useMemo(
    () => {
      if (isNil(recontact) && !isLoading) {
        return {
          pathname,
          search: getNextSearch(search, new Map([
            ['recontact', !isNewDatabox],
          ])),
          ...locationRest,
        };
      }
      return null;
    },
    [recontact, isLoading, pathname, search, isNewDatabox, locationRest],
  );

  const addEmailTo = useMemo(
    () => ({
      pathname,
      search: getNextSearch(search, new Map([
        [CONFIG_KEY, 'provider'],
      ])),
      ...locationRest,
    }),
    [pathname, search, locationRest],
  );

  const primary = useMemo(
    () => ({
      ...mailtoProps,
      standing: BUTTON_STANDINGS.MAIN,
      text: t('common:send'),
    }),
    [mailtoProps, t],
  );

  if (!isNil(redirectTo)) {
    return (
      <Redirect
        to={redirectTo}
      />
    );
  }

  return (
    <ScreenAction
      {...screenPropsWithDataboxURL}
      title={t('citizen:contact.preview.title')}
      navigationProps={navigationProps}
      navigation={(
        <Button
          {...primary}
        />
        )}
    >
      <Container maxWidth="md" className={clsx({ [classes.container]: IS_PLUGIN })}>
        <ExpansionPanelContactFrom
          databox={databox}
          appName={name}
          initialEmail={initialEmail}
          contactEmail={contactEmail}
          options={options}
          addButton={(
            <Button
              startIcon={<AddIcon />}
              standing={BUTTON_STANDINGS.TEXT}
              text={t('citizen:contact.email.add')}
              component={Link}
              to={addEmailTo}
              replace
            />
          )}
        />
        <CardContactTo application={entity} my={2} />
        <CardContactSubject my={2} subject={subject} />
        <CardContactBody
          button={!isNil(exitRecontact) && (
            <Button
              size="small"
              standing={BUTTON_STANDINGS.TEXT}
              text={t('citizen:contact.preview.exitRecontact')}
              component={Link}
              to={exitRecontact}
              replace
            />
          )}
        >
          {body}
        </CardContactBody>
        <ContactConfig
          searchKey={CONFIG_KEY}
          userId={userId}
          userEmails={userEmails}
          databox={databox}
        />
        <ContactConfirm
          searchKey={CONFIRM_KEY}
          contactEmail={contactEmail}
          mailto={dpoEmail}
          subject={subject}
          body={body}
          doneTo={doneTo}
        />
      </Container>
    </ScreenAction>
  );
};

ContactPreview.propTypes = {
  t: PropTypes.func.isRequired,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  screenProps: PropTypes.shape({
    state: SCREEN_STATE_PROPTYPES.isRequired,
  }).isRequired,
  // withDataboxURL
  databoxURL: PropTypes.string,
  databox: PropTypes.shape(DataboxSchema.propTypes),
  isNewDatabox: PropTypes.bool,
  isFetchingDatabox: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  // withUserEmails
  userEmails: PropTypes.arrayOf(PropTypes.shape(UserEmailSchema.propTypes)),
  userId: PropTypes.string,
  // CONNECT
  contactEmail: PropTypes.string,
};

ContactPreview.defaultProps = {
  entity: null,
  databoxURL: null,
  databox: null,
  userId: null,
  userEmails: null,
  isNewDatabox: null,
  contactEmail: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  contactEmail: state.screens.contact.contactEmail,
});

export default connect(mapStateToProps, {})(
  withDataboxURL({
    params: { withUsers: true },
    getExtraShouldFetch: hasMissingOwner,
  })(withTranslation(['common', 'citizen'])(ContactPreview)),
);
