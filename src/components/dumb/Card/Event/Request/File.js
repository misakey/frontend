import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import numbro from 'numbro';
import { makeStyles } from '@material-ui/core/styles';

import { FILE_SIZE_FORMAT } from 'constants/formats/numbers';
import { WORKSPACE } from 'constants/workspaces';
import { DPO, OWNER } from 'constants/databox/event';

import DatavizHeader from 'components/dumb/Dataviz/Header';
import EventCard from 'components/dumb/Card/Event';
import ButtonDownloadBlob from 'components/smart/Button/Download/Blob';
import DataboxSchema from 'store/schemas/Databox';
import ActivityLogsSchema from 'store/schemas/Databox/ActivityLogs';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import path from '@misakey/helpers/path';

import { AVAILABLE_DATAVIZ_DOMAINS } from 'components/dumb/Dataviz';
import BlobSchema from 'store/schemas/Databox/Blob';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dataviz: ({ mainColor }) => ({
    backgroundColor: mainColor || theme.palette.primary.main,
  }),
}));

// HELPERS
const producerApplicationPath = path(['producer', 'application']);

// COMPONENTS
const EventCardFileDownload = ({
  application,
  isFromCurrentUser,
  author,
  owner,
  text,
  blob,
  t,
  ...rest
}) => {
  const classes = useStyles({ mainColor: application.mainColor });
  const { name: applicationName, mainDomain } = application;
  const { displayName } = owner;

  const isDatavizEnabled = useMemo(
    () => AVAILABLE_DATAVIZ_DOMAINS.includes(mainDomain),
    [mainDomain],
  );

  const titleProps = useMemo(() => {
    if (isDatavizEnabled) {
      return ({
        title: (
          <DatavizHeader
            className={classes.dataviz}
            user={owner}
            application={application}
            title={t('citizen:dataviz.fileCardTitle', { appName: applicationName, userName: displayName })}
          />
        ),
        classes: { root: classes.dataviz },
      });
    }
    return {};
  }, [application, applicationName, classes.dataviz, displayName, isDatavizEnabled, owner, t]);

  return (
    <EventCard
      author={author}
      isFromCurrentUser={isFromCurrentUser}
      titleProps={titleProps}
      text={text}
      actions={(
        <ButtonDownloadBlob
          key={`download-blob-${blob.id}`}
          blob={blob}
          isDatavizEnabled={isDatavizEnabled}
          application={application}
        />
      )}
      {...omitTranslationProps(rest)}
    />
  );
};

EventCardFileDownload.propTypes = {
  application: PropTypes.shape({
    mainDomain: PropTypes.string,
    name: PropTypes.string,
    mainColor: PropTypes.string,
  }).isRequired,
  isFromCurrentUser: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  author: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUri: PropTypes.string,
  }).isRequired,
  owner: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUri: PropTypes.string,
  }).isRequired,
  blob: PropTypes.shape(BlobSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

const EventCardFileDownloadable = withTranslation('citizen')(EventCardFileDownload);

const RequestFileCardEvent = ({ event, request, fromWorkspace, ...rest }) => {
  const { author, authorRole, metadata } = useMemo(() => event, [event]);
  const { blob } = useMemo(() => metadata || {}, [metadata]);
  const application = useMemo(() => producerApplicationPath(request), [request]);
  const { owner } = useMemo(() => request, [request]);

  const text = useMemo(() => {
    const { id: blobId, fileExtension, contentLength } = blob || {};
    return `${blobId}${fileExtension} (${numbro(contentLength).format(FILE_SIZE_FORMAT)})`;
  }, [blob]);

  const isFromCurrentUser = useMemo(
    () => {
      if (fromWorkspace === WORKSPACE.DPO) {
        return authorRole === DPO;
      }
      return authorRole === OWNER;
    },
    [authorRole, fromWorkspace],
  );

  if (fromWorkspace === WORKSPACE.CITIZEN) {
    return (
      <EventCardFileDownloadable
        application={application}
        isFromCurrentUser={isFromCurrentUser}
        author={author}
        owner={owner}
        text={text}
        blob={blob}
        {...rest}
      />
    );
  }
  return (
    <EventCard
      author={author}
      isFromCurrentUser={isFromCurrentUser}
      text={text}
      {...omitTranslationProps(rest)}
    />
  );
};

RequestFileCardEvent.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes).isRequired,
  fromWorkspace: PropTypes.string,
  event: PropTypes.shape(ActivityLogsSchema.propTypes).isRequired,
};

RequestFileCardEvent.defaultProps = {
  fromWorkspace: null,
};

export default RequestFileCardEvent;
