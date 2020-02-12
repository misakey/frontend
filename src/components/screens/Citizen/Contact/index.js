import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { setSelected } from 'store/actions/screens/applications';

import prop from '@misakey/helpers/prop';
import propOr from '@misakey/helpers/propOr';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NotificationImportant from '@material-ui/icons/NotificationImportant';
import IconError from '@material-ui/icons/Error';
import Tooltip from '@material-ui/core/Tooltip';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';
import BoxSection from 'components/dumb/Box/Section';
import PreMail from 'components/dumb/Pre/Mail';
import Subtitle from 'components/dumb/Typography/Subtitle';
import Box from '@material-ui/core/Box';
import BoxMessage from 'components/dumb/Box/Message';
import withBulkContact from 'components/smart/withBulkContact';
import ContactProvidersBlock from 'components/smart/Contact/Providers';
import ToggleButtonGroupMailType from 'components/dumb/ToggleButtonGroup/MailType';

import MAIL_TYPES, { LEGAL } from 'constants/mailTypes';
import RECONTACT_MAIL_TYPES, {
  NO_ANSWER as NO_ANSWER_MAIL_TYPE,
  REFUSED as REFUSED_MAIL_TYPE,
  NO_DATA as NO_DATA_MAIL_TYPE,
  OTHER_CHANNEL as OTHER_CHANNEL_MAIL_TYPE,
} from 'constants/mailTypes/recontact';
import { DONE, REFUSED, NO_DATA } from 'constants/databox/comment';
import mapDates from '@misakey/helpers/mapDates';
import DataboxSchema from 'store/schemas/Databox';
import { clearDataboxURLById } from 'store/actions/screens/contact';

import ApplicationSchema from 'store/schemas/Application';
import { CLOSED } from 'constants/databox/status';
import BoxControls from 'components/dumb/Box/Controls';

// CONSTANTS
const STEP = {
  preview: 'preview',
  providers: 'providers',
};

// HELPERS
const propOrEmptyObject = propOr({});
const propOrNull = propOr(null);

// HOOKS
const useStyles = makeStyles(() => ({
  panelSummary: {
    alignItems: 'center',
  },
}));

const getDefaultMailTypeRecontact = (dpoComment) => {
  if (dpoComment === REFUSED) {
    return REFUSED_MAIL_TYPE;
  }
  if (dpoComment === NO_DATA) {
    return NO_DATA_MAIL_TYPE;
  }
  if (dpoComment === DONE) {
    return OTHER_CHANNEL_MAIL_TYPE;
  }
  return NO_ANSWER_MAIL_TYPE;
};

const useGetEmailFor = (
  applicationsByIds,
  currentDataboxesByProducer,
  databoxURLsById,
  t,
  mailTypesByApp,
) => useCallback((id) => {
  const { name, mainDomain, dpoEmail } = propOrEmptyObject(id, applicationsByIds);
  const databox = prop(id, currentDataboxesByProducer);
  const { status, dpoComment } = databox || {};

  const { databoxURL, alreadyContacted } = propOrEmptyObject(id, databoxURLsById);
  const customMailType = propOrNull(id, mailTypesByApp);
  const defaultMailType = alreadyContacted ? getDefaultMailTypeRecontact(dpoComment) : LEGAL;
  const mailType = customMailType || defaultMailType;
  return {
    application: {
      id,
      mainDomain,
    },
    databox: {
      status,
      alreadyContacted,
    },
    mailType,
    mailProps: {
      mailto: dpoEmail,
      applicationName: name,
      body: t(`common:emailBody.${mailType || defaultMailType}`, {
        dpoEmail,
        databoxURL,
        mainDomain,
        ...mapDates(databox),
      }),
      subject: t('common:emailSubject'),
    },
  };
},
[applicationsByIds, currentDataboxesByProducer, databoxURLsById, mailTypesByApp, t]);

// HELPERS
const isClosed = (status) => status === CLOSED;

// COMPONENTS
const Contact = ({
  selectedApplications,
  applicationsByIds,
  currentDataboxesByProducer,
  databoxURLsById,
  isFetchingBulk,
  errorBulk,
  dispatchClearSelection,
  dispatchClearDataboxUrlsByIds,
  t,
}) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(null);
  const [step, setStep] = useState(STEP.preview);
  const [mailTypesByApp, setMailTypesByApp] = useState({});
  const selectionIsEmpty = useMemo(
    () => selectedApplications.length === 0,
    [selectedApplications.length],
  );

  const getEmailFor = useGetEmailFor(
    applicationsByIds,
    currentDataboxesByProducer,
    databoxURLsById,
    t,
    mailTypesByApp,
  );

  const state = useMemo(
    () => ({
      errorBulk,
      isLoading: isFetchingBulk,
    }),
    [errorBulk, isFetchingBulk],
  );

  const selectedApplicationsWithEmails = useMemo(
    () => selectedApplications.map((id) => (getEmailFor(id))),
    [getEmailFor, selectedApplications],
  );

  const mailtoProps = useMemo(
    () => selectedApplicationsWithEmails
      .filter(({ databox: { status } }) => status !== CLOSED)
      .map(({ mailProps }) => mailProps),
    [selectedApplicationsWithEmails],
  );

  const changeMailType = useCallback((id, mailType) => {
    setMailTypesByApp({ ...mailTypesByApp, [id]: mailType });
  }, [mailTypesByApp]);

  const goToNextStep = useCallback(() => setStep(STEP.providers), []);

  const getValues = useCallback((id, alreadyContacted) => {
    const types = alreadyContacted ? RECONTACT_MAIL_TYPES : MAIL_TYPES;
    return types.map((type) => ({ type, onClick: () => changeMailType(id, type) }));
  }, [changeMailType]);

  const onChangePanel = useCallback((panelId) => () => {
    setExpanded(expanded === panelId ? null : panelId);
  }, [expanded]);

  const onDone = useCallback(() => {
    dispatchClearSelection();
    dispatchClearDataboxUrlsByIds();
  }, [dispatchClearDataboxUrlsByIds, dispatchClearSelection]);

  return (
    <ScreenAction
      title={t('screens:contact.bulk.list.title')}
      display="flex"
      flexDirection="column"
      state={state}
      navigationProps={{
        goBackPath: routes.citizen._,
      }}
      fullHeight
    >
      {step === STEP.preview && (
        <Container maxWidth="md" className={classes.container}>
          <Subtitle>
            {t('screens:contact.bulk.list.subtitle')}
          </Subtitle>
          {selectionIsEmpty
            ? (
              <BoxMessage type="info" p={2}>
                <Typography>{t('screens:contact.bulk.list.empty')}</Typography>
              </BoxMessage>
            )
            : (
              <>
                <BoxSection my={3} p={0} className={classes.box}>
                  {
                    selectedApplicationsWithEmails.map(({
                      application: { id, mainDomain },
                      databox: { status, alreadyContacted },
                      mailProps: { body, mailto, subject, applicationName },
                      mailType,
                    }) => (
                      <ExpansionPanel
                        expanded={expanded === id}
                        key={id}
                        onChange={onChangePanel(id)}
                      >
                        <ExpansionPanelSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel-email-content"
                          id="panel-email-header"
                          classes={{ content: classes.panelSummary }}
                        >
                          {alreadyContacted && !isClosed(status) && (
                          <Tooltip title={t('screens:contact.bulk.recontact')}>
                            <NotificationImportant color="primary" />
                          </Tooltip>
                          )}
                          {isClosed(status) && (
                          <Tooltip title={t('screens:contact.bulk.closed')}>
                            <IconError color="error" />
                          </Tooltip>
                          )}
                          <Box display="flex" flexDirection="column" mx={1}>
                            <Typography>{applicationName}</Typography>
                            <Typography color="textSecondary">{mainDomain}</Typography>
                          </Box>
                          <Box flexGrow={1} />
                          <Box display="flex" flexDirection="column">
                            <Typography variant="caption">{t('common:mailType.group')}</Typography>
                            <Typography>{t(`common:mailType.types.${mailType}`)}</Typography>
                          </Box>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                          <Container maxWidth="md">
                            <ToggleButtonGroupMailType
                              values={getValues(id, alreadyContacted)}
                              currentValue={mailType}
                            />

                            <PreMail
                              subject={subject}
                              body={body}
                              mailto={(
                                <Trans
                                  values={{ applicationName, dpoEmail: mailto }}
                                  i18nKey="common:emailToTrans"
                                >
                                  {'DPO de {{applicationName}}'}
                                  <span>{'{{dpoEmail}}'}</span>
                                </Trans>
                                )}
                            />
                          </Container>
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    ))
                  }
                </BoxSection>
                <BoxControls
                  primary={{
                    onClick: goToNextStep,
                    text: t('common:next'),
                    disabled: selectionIsEmpty,
                  }}
                />
              </>
            )}

        </Container>
      )}
      {step === STEP.providers && (
        <ContactProvidersBlock
          onDone={onDone}
          doneTo={routes.citizen._}
          mailtoProps={mailtoProps}
        />
      )}
    </ScreenAction>
  );
};

Contact.propTypes = {
  selectedApplications: PropTypes.arrayOf(PropTypes.string),
  currentDataboxesByProducer: PropTypes.objectOf(PropTypes.shape(DataboxSchema.propTypes)),
  applicationsByIds: PropTypes.objectOf(PropTypes.shape(ApplicationSchema.propTypes)),
  databoxURLsById: PropTypes.objectOf(PropTypes.shape({
    databoxURL: PropTypes.string,
    alreadyContacted: PropTypes.bool,
  })),
  isFetchingBulk: PropTypes.bool,
  errorBulk: PropTypes.object,
  t: PropTypes.func.isRequired,
  dispatchClearSelection: PropTypes.func.isRequired,
  dispatchClearDataboxUrlsByIds: PropTypes.func.isRequired,
};

Contact.defaultProps = {
  selectedApplications: [],
  applicationsByIds: {},
  currentDataboxesByProducer: {},
  databoxURLsById: {},
  isFetchingBulk: false,
  errorBulk: null,
};


const mapDispatchToProps = (dispatch) => ({
  dispatchClearSelection: () => dispatch(setSelected([])),
  dispatchClearDataboxUrlsByIds: () => dispatch(clearDataboxURLById()),
});

export default connect(null, mapDispatchToProps)(withTranslation(['screens', 'common'])(withBulkContact()(Contact)));
