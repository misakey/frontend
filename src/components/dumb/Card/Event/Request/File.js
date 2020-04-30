import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import numbro from 'numbro';

import { FILE_SIZE_FORMAT } from 'constants/formats/numbers';
import { WORKSPACE } from 'constants/workspaces';
import { DPO, OWNER } from 'constants/databox/event';

import EventCard from 'components/dumb/Card/Event';
import ButtonDownloadBlob from 'components/smart/Button/Download/Blob';
import DataboxSchema from 'store/schemas/Databox';
import ActivityLogsSchema from 'store/schemas/Databox/ActivityLogs';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import path from '@misakey/helpers/path';

const producerApplicationPath = path(['producer', 'application']);


const RequestFileCardEvent = ({
  event,
  request,
  fromWorkspace,
  t,
  ...rest
}) => {
  const { author, authorRole, metadata } = useMemo(() => event, [event]);
  const application = useMemo(() => producerApplicationPath(request), [request]);

  const text = useMemo(() => {
    const { blob } = metadata || {};
    const { id: blobId, fileExtension, contentLength } = blob || {};
    return `${blobId}${fileExtension} (${numbro(contentLength).format(FILE_SIZE_FORMAT)})`;
  }, [metadata]);

  const isFromCurrentUser = useMemo(
    () => {
      if (fromWorkspace === WORKSPACE.DPO) {
        return authorRole === DPO;
      }
      return authorRole === OWNER;
    },
    [authorRole, fromWorkspace],
  );

  const actions = useMemo(() => {
    if (fromWorkspace === WORKSPACE.CITIZEN) {
      const { blob } = metadata;
      return [
        <ButtonDownloadBlob key={`download-blob-${blob.id}`} blob={blob} application={application} />,
      ];
    }
    return null;
  }, [application, fromWorkspace, metadata]);

  return (
    <EventCard
      author={author}
      isFromCurrentUser={isFromCurrentUser}
      text={text}
      actions={actions}
      {...omitTranslationProps(rest)}
    />
  );
};

RequestFileCardEvent.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes).isRequired,
  fromWorkspace: PropTypes.string,
  event: PropTypes.shape(ActivityLogsSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

RequestFileCardEvent.defaultProps = {
  fromWorkspace: null,
};

export default withTranslation('common')(RequestFileCardEvent);
