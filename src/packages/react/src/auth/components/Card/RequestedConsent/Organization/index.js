import React, { forwardRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';

import { APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER, LARGE } from '@misakey/ui/constants/sizes';
import { CONSENTED_SCOPES_KEY } from '@misakey/core/auth/constants/consent';
import OrganizationsSchema from '@misakey/react/auth/store/schemas/Organizations';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';
import {
  PROP_TYPES as REQUESTED_CONSENT_DATATAG_PROP_TYPES,
} from '@misakey/react/auth/constants/propTypes/requestedConsent/datatag';

import { pickUserPropsRemapIdentifier } from '@misakey/core/helpers/user';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';

import CardSsoWithSlope from '@misakey/react/auth/components/Card/Sso/WithSlope';
import AvatarClientRequestedConsent from '@misakey/ui/Avatar/Client/RequestedConsent';
import TransRequestedConsent from '@misakey/ui/Trans/RequestedConsent';
import Accordion from '@misakey/ui/Accordion';
import AccordionSummary from '@misakey/ui/AccordionSummary';
import ListItemUser from '@misakey/ui/ListItem/User';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Formik from '@misakey/ui/Formik';
import { Form, Field } from 'formik';
import FieldBooleanControlSwitch from '@misakey/ui/Form/Field/BooleanControl/Switch';
import BoxControls from '@misakey/ui/Box/Controls';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Slide from '@material-ui/core/Slide';
import AppBar from '@misakey/ui/AppBar';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import LabelIcon from '@material-ui/icons/Label';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// CONSTANTS
const SLOPE_PROPS = {
  // @FIXME approximate spacing to align card content with slope
  height: APPBAR_HEIGHT + AVATAR_SIZE * LARGE_MULTIPLIER + 126,
};

// HOOKS
const useStyles = makeStyles(() => ({
  accordionSummaryRoot: {
    padding: 0,
  },
}));

// COMPONENTS
const CardRequestedConsentOrganization = forwardRef(({
  organization, client, consents, subjectIdentity,
  onSubmit, isFetching, stepChanged,
  onSignOut,
}, ref) => {
  const classes = useStyles();
  const { t } = useTranslation(['common', 'datatags']);

  const initialValues = useMemo(
    () => consents.reduce(
      (aggr, { alreadyConsented, scope }) => ({ ...aggr, [scope]: alreadyConsented }),
      {},
    ),
    [consents],
  );

  const { name: clientName } = useSafeDestr(client);

  const listItemUserProps = useMemo(
    () => pickUserPropsRemapIdentifier(subjectIdentity),
    [subjectIdentity],
  );

  const primary = useMemo(
    () => ({
      text: t('common:authorize'),
      isLoading: isFetching,
    }),
    [isFetching, t],
  );

  const handleSubmit = useCallback(
    (values, ...rest) => {
      const consentedScopes = Object.entries(values)
        .reduce((aggr, [scope, consented]) => (consented === true ? [...aggr, scope] : aggr), []);

      const consentedConsents = consents.filter(({ scope }) => consentedScopes.includes(scope));

      return onSubmit({ [CONSENTED_SCOPES_KEY]: consentedConsents }, ...rest);
    },
    [consents, onSubmit],
  );

  return (
    <Slide
      direction="left"
      in={!stepChanged}
    >
      <CardSsoWithSlope
        slopeProps={SLOPE_PROPS}
        avatar={(
          <AvatarClientRequestedConsent
            client={client}
            organization={organization}
            transitionProps={{ in: !stepChanged }}
          />
      )}
        avatarSize={LARGE}
        ref={ref}
        header={(
          <AppBar color="primary">
            <Button
              color="background"
              standing={BUTTON_STANDINGS.TEXT}
              onClick={onSignOut}
              text={(
                <>
                  <ArrowBackIcon />
                  {t('auth:login.secret.changeAccount')}
                </>
              )}
            />
          </AppBar>
        )}
      >
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          <Box component={Form} display="flex" flexDirection="column">
            <TransRequestedConsent align="center" client={client} organization={organization} />
            <Accordion
              defaultExpanded
              elevation={0}
            >
              <AccordionSummary
                classes={{ root: classes.accordionSummaryRoot }}
                expandIcon={<ExpandMoreIcon />}
              >
                <ListItemUser disableGutters {...listItemUserProps} />
              </AccordionSummary>
              <List disablePadding>
                {consents.map(({ scope, details: { datatag: { name } } }) => (
                  <ListItem key={scope}>
                    <ListItemIcon>
                      <LabelIcon />
                    </ListItemIcon>
                    <ListItemText>
                      {t([`datatags:${name}_plural`, 'datatags:default_plural'])}
                    </ListItemText>
                    <ListItemSecondaryAction>
                      <Field
                        component={FieldBooleanControlSwitch}
                        name={`['${scope}']`}
                        color="primary"
                        defaultValue={false}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Accordion>
            <Subtitle>
              <Trans values={{ creatorName: clientName }} i18nKey="common:connect.authorize">
                {'Authorize '}
                <Typography display="inline" color="primary">{'{{creatorName}}'}</Typography>
                {' to access above information ?'}
              </Trans>
            </Subtitle>
            <BoxControls
              formik
              primary={primary}
            />
          </Box>
        </Formik>
      </CardSsoWithSlope>
    </Slide>
  );
});

CardRequestedConsentOrganization.propTypes = {
  organization: PropTypes.shape(OrganizationsSchema.propTypes).isRequired, // requested consent org
  client: SSO_PROP_TYPES.client.isRequired, // flow initiator = the one who wants data
  consents: PropTypes.arrayOf(PropTypes.shape(REQUESTED_CONSENT_DATATAG_PROP_TYPES)),
  subjectIdentity: SSO_PROP_TYPES.subjectIdentity.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  stepChanged: PropTypes.bool,
};

CardRequestedConsentOrganization.defaultProps = {
  consents: [],
  isFetching: false,
  stepChanged: false,
};

export default CardRequestedConsentOrganization;
