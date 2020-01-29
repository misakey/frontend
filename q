[1mdiff --git a/src/components/dumb/Card/Feedback/Summary/index.js b/src/components/dumb/Card/Feedback/Summary/index.js[m
[1mindex f75949fa..48ae9449 100644[m
[1m--- a/src/components/dumb/Card/Feedback/Summary/index.js[m
[1m+++ b/src/components/dumb/Card/Feedback/Summary/index.js[m
[36m@@ -68,7 +68,7 @@[m [mconst SummaryFeedbackCard = ({ application, hideLink, hideTitle, t }) => {[m
   );[m
 [m
   return ([m
[31m-    <Card classes={{ root: classes.card }}>[m
[32m+[m[32m    <Box classes={{ root: classes.card }}>[m
       {(!hideTitle || !hideLink) && ([m
         <CardHeader[m
           title={title}[m
[36m@@ -110,7 +110,7 @@[m [mconst SummaryFeedbackCard = ({ application, hideLink, hideTitle, t }) => {[m
           totalRating={totalRating}[m
         />[m
       </CardContent>[m
[31m-    </Card>[m
[32m+[m[32m    </Box>[m
 [m
   );[m
 };[m
[1mdiff --git a/src/components/screens/Citizen/Application/Info/Box/index.js b/src/components/screens/Citizen/Application/Info/Box/index.js[m
[1mindex 7b408180..af2b30b0 100644[m
[1m--- a/src/components/screens/Citizen/Application/Info/Box/index.js[m
[1m+++ b/src/components/screens/Citizen/Application/Info/Box/index.js[m
[36m@@ -310,7 +310,7 @@[m [mfunction ApplicationBox({[m
 [m
   return ([m
     <>[m
[31m-      {(loading) ? ([m
[32m+[m[32m      {(loading && isAuthenticated) ? ([m
         <OnLoading />[m
       ) : ([m
         <>[m
[36m@@ -372,9 +372,11 @@[m [mfunction ApplicationBox({[m
         </>[m
       )}[m
 [m
[32m+[m[32m      <Title>[m
[32m+[m[32m        {t('screens:application.box.info.title')}[m
[32m+[m[32m      </Title>[m
       <Card[m
[31m-        my={3}[m
[31m-        title={t('screens:application.box.info.title')}[m
[32m+[m[32m        mb={3}[m
         primary={!isAuthenticated ? ([m
           <ButtonConnectSimple buttonProps={{ variant: 'contained' }}>[m
             {t('screens:application.box.info.primaryButton')}[m
[36m@@ -387,37 +389,38 @@[m [mfunction ApplicationBox({[m
           />[m
         ) : null}[m
       >[m
[31m-        <Grid container spacing={3}>[m
[31m-          <Grid item sm={8} xs={12}>[m
[31m-            <Typography>[m
[31m-              <Trans i18nKey="screens:application.box.info.details">[m
[31m-                Votre coffre-fort est chiffré par une clé secrète, elle même protégée par votre mot[m
[31m-                de passe. Vous seul avez accès à cette clé qui permet de lire les données contenues[m
[31m-                dans votre coffre. Lorsqu’un site vous envoie des données, elles sont chiffrées[m
[31m-                avant d’être envoyées dans votre coffre afin que vous seul puissiez y accéder.[m
[31m-                Misakey ne peut pas lire vos données.[m
[31m-                <br />[m
[31m-                <br />[m
[31m-                En cas de perte de votre mot de passe, vos données ne seront plus accessibles.[m
[31m-              </Trans>[m
[31m-            </Typography>[m
[31m-          </Grid>[m
[31m-          <Hidden xsDown>[m
[31m-            <Grid item sm={1} />[m
[31m-            <Grid item sm={3}>[m
[31m-              <img[m
[31m-                src="/img/illustrations/portability.png"[m
[31m-                className={classes.portabilityIllu}[m
[31m-                alt={t('screens:application.box.info.altIllu')}[m
[31m-              />[m
[31m-            </Grid>[m
[31m-          </Hidden>[m
[31m-        </Grid>[m
[31m-      </Card>[m
[31m-      <Card>[m
         <CardContent>[m
[31m-          <Title>{t(`${QUESTIONS_TRANS_KEY}.title`)}</Title>[m
[32m+[m[32m          <Grid container spacing={3}>[m
[32m+[m[32m            <Grid item sm={8} xs={12}>[m
[32m+[m[32m              <Typography>[m
[32m+[m[32m                <Trans i18nKey="screens:application.box.info.details">[m
[32m+[m[32m                  Votre coffre-fort est chiffré par une clé secrète, elle même protégée par votre mot[m
[32m+[m[32m                  de passe. Vous seul avez accès à cette clé qui permet de lire les données contenues[m
[32m+[m[32m                  dans votre coffre. Lorsqu’un site vous envoie des données, elles sont chiffrées[m
[32m+[m[32m                  avant d’être envoyées dans votre coffre afin que vous seul puissiez y accéder.[m
[32m+[m[32m                  Misakey ne peut pas lire vos données.[m
[32m+[m[32m                  <br />[m
[32m+[m[32m                  <br />[m
[32m+[m[32m                  En cas de perte de votre mot de passe, vos données ne seront plus accessibles.[m
[32m+[m[32m                </Trans>[m
[32m+[m[32m              </Typography>[m
[32m+[m[32m            </Grid>[m
[32m+[m[32m            <Hidden xsDown>[m
[32m+[m[32m              <Grid item sm={1} />[m
[32m+[m[32m              <Grid item sm={3}>[m
[32m+[m[32m                <img[m
[32m+[m[32m                  src="/img/illustrations/portability.png"[m
[32m+[m[32m                  className={classes.portabilityIllu}[m
[32m+[m[32m                  alt={t('screens:application.box.info.altIllu')}[m
[32m+[m[32m                />[m
[32m+[m[32m              </Grid>[m
[32m+[m[32m            </Hidden>[m
[32m+[m[32m          </Grid>[m
         </CardContent>[m
[32m+[m[32m      </Card>[m
[32m+[m
[32m+[m[32m      <Title>{t(`${QUESTIONS_TRANS_KEY}.title`)}</Title>[m
[32m+[m[32m      <Card mb={3}>[m
         <ListQuestions items={questionItems} breakpoints={{ sm: 6, xs: 12 }} />[m
         <ListQuestions items={conditionalQuestionItems} breakpoints={{ sm: 6, xs: 12 }} />[m
       </Card>[m
[1mdiff --git a/src/components/screens/Citizen/Application/Info/Legal/ThirdPArtySummary/index.js b/src/components/screens/Citizen/Application/Info/Legal/ThirdPArtySummary/index.js[m
[1mdeleted file mode 100644[m
[1mindex 972bc3d6..00000000[m
[1m--- a/src/components/screens/Citizen/Application/Info/Legal/ThirdPArtySummary/index.js[m
[1m+++ /dev/null[m
[36m@@ -1,238 +0,0 @@[m
[31m-import React, { useMemo, useCallback, useEffect } from 'react';[m
[31m-import PropTypes from 'prop-types';[m
[31m-import { connect } from 'react-redux';[m
[31m-import { withTranslation } from 'react-i18next';[m
[31m-import { makeStyles } from '@material-ui/core/styles';[m
[31m-import className from 'clsx';[m
[31m-[m
[31m-import orderBy from '@misakey/helpers/orderBy';[m
[31m-import getNextSearch from 'helpers/getNextSearch';[m
[31m-import isNil from '@misakey/helpers/isNil';[m
[31m-[m
[31m-import { setDetectedTrackers } from 'store/actions/screens/thirdparty';[m
[31m-[m
[31m-import TrackersSchema from 'store/schemas/Trackers';[m
[31m-[m
[31m-import { sendMessage, listenForBackground, stopListenerForBackground } from 'background';[m
[31m-import { GET_BLOCKED_INFOS, REFRESH_BLOCKED_INFOS, RESTART_BG } from 'background/messages';[m
[31m-import { storeLinks } from 'constants/plugin';[m
[31m-import { openInNewTab } from 'helpers/plugin';[m
[31m-import { isChrome } from 'helpers/devices';[m
[31m-[m
[31m-import Typography from '@material-ui/core/Typography';[m
[31m-import Skeleton from '@material-ui/lab/Skeleton';[m
[31m-[m
[31m-import BoxMessage from 'components/dumb/Box/Message';[m
[31m-import Card from 'components/dumb/Card';[m
[31m-import CardContent from '@material-ui/core/CardContent';[m
[31m-import List from '@material-ui/core/List';[m
[31m-import ListItem from '@material-ui/core/ListItem';[m
[31m-import ListItemText from '@material-ui/core/ListItemText';[m
[31m-import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';[m
[31m-[m
[31m-import routes from 'routes';[m
[31m-[m
[31m-const LINK_TO_STORE = isChrome() ? storeLinks.chrome : storeLinks.firefox;[m
[31m-[m
[31m-const useStyles = makeStyles((theme) => ({[m
[31m-  content: {[m
[31m-    padding: 0,[m
[31m-    '&:last-child': {[m
[31m-      paddingBottom: 0,[m
[31m-    },[m
[31m-  },[m
[31m-  listItem: {[m
[31m-    borderTop: `1px solid ${theme.palette.grey[400]}`,[m
[31m-    paddingTop: theme.spacing(2),[m
[31m-    paddingBottom: theme.spacing(2),[m
[31m-    cursor: 'pointer',[m
[31m-  },[m
[31m-  listItemEmpty: {[m
[31m-    textAlign: 'center',[m
[31m-  },[m
[31m-  arrowIcon: {[m
[31m-    marginLeft: '1rem',[m
[31m-  },[m
[31m-}));[m
[31m-[m
[31m-[m
[31m-const useFormatDetectedTrackers = () => useCallback((trackers, sort = false) => {[m
[31m-  const formattedTrackers = trackers.map((tracker) => {[m
[31m-    const { apps } = tracker;[m
[31m-    const blockedApps = apps.filter(((app) => app.blocked));[m
[31m-    return {[m
[31m-      ...tracker,[m
[31m-      blockedApps,[m
[31m-      isWhitelisted: blockedApps.length !== apps.length,[m
[31m-    };[m
[31m-  });[m
[31m-  return sort ? orderBy(formattedTrackers, ['isWhitelisted', 'name'], ['desc', 'asc']) : formattedTrackers;[m
[31m-}, []);[m
[31m-[m
[31m-const useListenForBackgroundCb = ([m
[31m-  formatDetectedTrackers,[m
[31m-  dispatchDetectedTrackers,[m
[31m-) => useCallback((msg) => {[m
[31m-  if (msg.action === REFRESH_BLOCKED_INFOS) {[m
[31m-    const sorted = formatDetectedTrackers(msg.detectedTrackers, true);[m
[31m-    dispatchDetectedTrackers(sorted || []);[m
[31m-  }[m
[31m-}, [formatDetectedTrackers, dispatchDetectedTrackers]);[m
[31m-[m
[31m-function ThirdPartyBlock({[m
[31m-  dispatchDetectedTrackers,[m
[31m-  detectedTrackers,[m
[31m-  entity,[m
[31m-  history,[m
[31m-  location: { search },[m
[31m-  t,[m
[31m-}) {[m
[31m-  const classes = useStyles();[m
[31m-  const [isFetching, setFetching] = React.useState(false);[m
[31m-  const [error, setError] = React.useState(false);[m
[31m-  const { mainDomain } = useMemo(() => (entity || { mainDomain: '' }), [entity]);[m
[31m-  const empty = useMemo(() => detectedTrackers.length === 0, [detectedTrackers]);[m
[31m-[m
[31m-  const formatDetectedTrackers = useFormatDetectedTrackers();[m
[31m-  const listenForBackgroundCb = useListenForBackgroundCb([m
[31m-    formatDetectedTrackers,[m
[31m-    dispatchDetectedTrackers,[m
[31m-  );[m
[31m-[m
[31m-  const formattedDetectedTrackers = useMemo([m
[31m-    () => (formatDetectedTrackers(detectedTrackers)),[m
[31m-    [detectedTrackers, formatDetectedTrackers],[m
[31m-  );[m
[31m-[m
[31m-  function getData() {[m
[31m-    if (!isFetching) {[m
[31m-      setFetching(true);[m
[31m-      sendMessage(GET_BLOCKED_INFOS)[m
[31m-        .then((response) => {[m
[31m-          const sorted = formatDetectedTrackers(response.detectedTrackers, true);[m
[31m-          dispatchDetectedTrackers(sorted || []);[m
[31m-        })[m
[31m-        .catch((err) => {[m
[31m-          if (err.message === 'not_launched') {[m
[31m-            setError(true);[m
[31m-          }[m
[31m-        })[m
[31m-        .finally(() => { setFetching(false); });[m
[31m-    }[m
[31m-[m
[31m-    listenForBackground(listenForBackgroundCb);[m
[31m-[m
[31m-    return () => { stopListenerForBackground(listenForBackgroundCb); };[m
[31m-  }[m
[31m-[m
[31m-  const setupAction = useCallback((purpose) => {[m
[31m-    const nextParams = new Map([['mainDomain', mainDomain]]);[m
[31m-    if (!isNil(purpose)) {[m
[31m-      nextParams.set('mainPurpose', purpose);[m
[31m-    }[m
[31m-[m
[31m-    const query = getNextSearch(search, nextParams);[m
[31m-    history.push({[m
[31m-      pathname: routes.account.thirdParty.setup,[m
[31m-      search: query,[m
[31m-    });[m
[31m-  }, [history, mainDomain, search]);[m
[31m-[m
[31m-  useEffect(getData, []);[m
[31m-[m
[31m-  if (error) {[m
[31m-    return ([m
[31m-      <Card[m
[31m-        my={2}[m
[31m-        title={t('screens:application.thirdParty.summary.title')}[m
[31m-        primary={{ onClick: () => sendMessage(RESTART_BG), text: t('screens:application.thirdParty.error.button.restart'), variant: 'contained' }}[m
[31m-        secondary={{ onClick: () => openInNewTab(LINK_TO_STORE), text: t('screens:application.thirdParty.error.button.update') }}[m
[31m-      >[m
[31m-        <BoxMessage type="error" text={t('screens:application.thirdParty.error.description')} />[m
[31m-      </Card>[m
[31m-    );[m
[31m-  }[m
[31m-[m
[31m-  return ([m
[31m-    <Card[m
[31m-      my={2}[m
[31m-      title={t('screens:application.thirdParty.summary.title')}[m
[31m-      subtitle={t('screens:application.thirdParty.summary.description')}[m
[31m-    >[m
[31m-      <CardContent className={classes.content}>[m
[31m-        <List aria-labelledby="list-apps">[m
[31m-          {[m
[31m-            empty && ([m
[31m-              <ListItem className={classes.listItem}>[m
[31m-                <ListItemText[m
[31m-                  primary={[m
[31m-                    isFetching[m
[31m-                      ? <Skeleton variant="text" style={{ margin: 0 }} />[m
[31m-                      : t('screens:application.thirdParty.summary.count.empty')[m
[31m-                  }[m
[31m-                  className={classes.listItemEmpty}[m
[31m-                  onClick={() => setupAction()}[m
[31m-                />[m
[31m-              </ListItem>[m
[31m-            )[m
[31m-          }[m
[31m-          {[m
[31m-            formattedDetectedTrackers.map(({ name, apps, blockedApps }) => ([m
[31m-              <ListItem[m
[31m-                key={name}[m
[31m-                className={className(classes.listItem)}[m
[31m-                onClick={() => setupAction(name)}[m
[31m-              >[m
[31m-                <ListItemText[m
[31m-                  id={`switch-list-label-${name}`}[m
[31m-                  primary={t(`screens:application.thirdParty.purposes.${name}`)}[m
[31m-                />[m
[31m-[m
[31m-                <Typography variant="caption">[m
[31m-                  {[m
[31m-                  `${t('screens:application.thirdParty.summary.count.blocked', { count: blockedApps.length })} [m
[31m-                   /[m
[31m-                   ${t('screens:application.thirdParty.summary.count.detected', { count: apps.length })}`[m
[31m-                  }[m
[31m-                </Typography>[m
[31m-                <KeyboardArrowRight className={classes.arrowIcon} />[m
[31m-[m
[31m-              </ListItem>[m
[31m-            ))[m
[31m-          }[m
[31m-        </List>[m
[31m-      </CardContent>[m
[31m-    </Card>[m
[31m-  );[m
[31m-}[m
[31m-[m
[31m-ThirdPartyBlock.propTypes = {[m
[31m-  detectedTrackers: PropTypes.arrayOf(PropTypes.shape({[m
[31m-    name: PropTypes.string,[m
[31m-    whitelisted: PropTypes.bool,[m
[31m-    apps: PropTypes.arrayOf(PropTypes.shape(TrackersSchema)),[m
[31m-  })).isRequired,[m
[31m-  entity: PropTypes.shape({ logoUri: PropTypes.string, mainDomain: PropTypes.string }),[m
[31m-  dispatchDetectedTrackers: PropTypes.func.isRequired,[m
[31m-  history: PropTypes.object.isRequired,[m
[31m-  location: PropTypes.shape({[m
[31m-    search: PropTypes.string.isRequired,[m
[31m-  }).isRequired,[m
[31m-  t: PropTypes.func.isRequired,[m
[31m-};[m
[31m-[m
[31m-ThirdPartyBlock.defaultProps = {[m
[31m-  entity: null,[m
[31m-};[m
[31m-[m
[31m-[m
[31m-// CONNECT[m
[31m-const mapStateToProps = (state) => ({[m
[31m-  detectedTrackers: state.screens.thirdparty.detectedTrackers,[m
[31m-});[m
[31m-[m
[31m-const mapDispatchToProps = (dispatch) => ({[m
[31m-  dispatchDetectedTrackers: (data) => dispatch(setDetectedTrackers(data)),[m
[31m-});[m
[31m-[m
[31m-export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['screens'])(ThirdPartyBlock));[m
[1mdiff --git a/src/components/screens/Citizen/Application/Info/Legal/index.js b/src/components/screens/Citizen/Application/Info/Legal/index.js[m
[1mindex 6dbf4a4c..f47a13ce 100644[m
[1m--- a/src/components/screens/Citizen/Application/Info/Legal/index.js[m
[1m+++ b/src/components/screens/Citizen/Application/Info/Legal/index.js[m
[36m@@ -30,6 +30,9 @@[m [mimport { BUTTON_STANDINGS } from 'components/dumb/Button';[m
 [m
 import CardSimpleTextButton from 'components/dumb/Card/Simple/TextButton';[m
 [m
[32m+[m[32mimport DetectedTrackersSummary from 'components/screens/Citizen/Application/Info/Legal/ThirdPartySummary';[m
[32m+[m
[32m+[m
 // CONSTANTS[m
 const linksType = ['privacy_policy', 'tos', 'cookies'];[m
 [m
[36m@@ -53,6 +56,8 @@[m [mconst ApplicationInfoLegal = ({[m
   application,[m
   isLoading,[m
   t,[m
[32m+[m[32m  history,[m
[32m+[m[32m  location,[m
   onContributionLinkClick,[m
 }) => {[m
   const links = useMemo([m
[36m@@ -95,14 +100,19 @@[m [mconst ApplicationInfoLegal = ({[m
   if (isEmpty(application)) { return null; }[m
 [m
   return ([m
[31m-    <Box mt={3}>[m
[31m-      <Title>[m
[31m-        {t('screens:application.info.legal.linksListTitle')}[m
[31m-      </Title>[m
[31m-      {links.map(({ key, label, button }) => ([m
[31m-        <CardSimpleTextButton key={key} text={label} button={button} my={1} />[m
[31m-      ))}[m
[31m-    </Box>[m
[32m+[m[32m    <>[m
[32m+[m[32m      {IS_PLUGIN && ([m
[32m+[m[32m        <DetectedTrackersSummary entity={application} history={history} location={location} />[m
[32m+[m[32m      )}[m
[32m+[m[32m      <Box mt={3}>[m
[32m+[m[32m        <Title>[m
[32m+[m[32m          {t('screens:application.info.legal.linksListTitle')}[m
[32m+[m[32m        </Title>[m
[32m+[m[32m        {links.map(({ key, label, button }) => ([m
[32m+[m[32m          <CardSimpleTextButton key={key} text={label} button={button} my={1} />[m
[32m+[m[32m        ))}[m
[32m+[m[32m      </Box>[m
[32m+[m[32m    </>[m
   );[m
 };[m
 [m
[1mdiff --git a/src/components/screens/Citizen/Application/Info/ThirdParty/index.js b/src/components/screens/Citizen/Application/Info/ThirdParty/index.js[m
[1mindex dd644c60..86f8bd9f 100644[m
[1m--- a/src/components/screens/Citizen/Application/Info/ThirdParty/index.js[m
[1m+++ b/src/components/screens/Citizen/Application/Info/ThirdParty/index.js[m
[36m@@ -18,6 +18,7 @@[m [mimport { IS_PLUGIN } from 'constants/plugin';[m
 [m
 import DetectedTrackersSummary from 'components/screens/Citizen/Application/Info/ThirdParty/Summary';[m
 [m
[32m+[m
 const requiredLinksType = ['cookies'];[m
 [m
 const ConnectLink = withDialogConnect(MUILink);[m
