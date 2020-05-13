import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { WORKSPACE } from 'constants/workspaces';
import { SENDING, ANSWERING, CONFIRM_EMAIL, DPO, OWNER, MISAKEY } from 'constants/databox/event';

import EventCard from 'components/dumb/Card/Event';
import DataboxSchema from 'store/schemas/Databox';
import ActivityLogsSchema from 'store/schemas/Databox/ActivityLogs';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

const RequestSimpleCardEvent = ({
  event,
  request,
  fromWorkspace,
  t,
  ...rest
}) => {
  const { action, author, authorRole, metadata } = useMemo(() => event, [event]);
  const { owner: { email: ownerEmail }, type } = useMemo(() => request, [request]);

  const text = useMemo(() => {
    if (action === SENDING) {
      return t(`common:requests.events.textMessage.${SENDING}.${type}`, { ownerEmail });
    }
    if (action === CONFIRM_EMAIL) {
      return t(`common:requests.events.textMessage.${CONFIRM_EMAIL}`, { ownerEmail });
    }
    if (action === ANSWERING) {
      const { dpoComment } = metadata;
      return t(`common:requests.events.textMessage.${ANSWERING}.${dpoComment}`);
    }

    return t(`common:requests.events.textMessage.${action}`);
  }, [action, metadata, ownerEmail, t, type]);

  const isFromCurrentUser = useMemo(
    () => {
      if (fromWorkspace === WORKSPACE.DPO) {
        return authorRole === DPO;
      }
      return authorRole === OWNER;
    },
    [authorRole, fromWorkspace],
  );

  const titleTypographyProps = useMemo(
    () => (authorRole === MISAKEY ? { color: 'secondary' } : {}),
    [authorRole],
  );

  return (
    <EventCard
      author={author}
      isFromCurrentUser={isFromCurrentUser}
      text={text}
      titleTypographyProps={titleTypographyProps}
      {...omitTranslationProps(rest)}
    />
  );
};

RequestSimpleCardEvent.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes).isRequired,
  fromWorkspace: PropTypes.string,
  event: PropTypes.shape(ActivityLogsSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

RequestSimpleCardEvent.defaultProps = {
  fromWorkspace: null,
};

export default withTranslation('common')(RequestSimpleCardEvent);
