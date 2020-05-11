import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import moment from 'moment';

import DataboxSchema from 'store/schemas/Databox';
import { UNKNOWN } from 'constants/databox/type';
import { DATE_SHORT } from 'constants/formats/dates';
import { DRAFT, OPEN, DONE, CLOSED } from 'constants/databox/status';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import capitalize from '@misakey/helpers/capitalize';

import Skeleton from '@material-ui/lab/Skeleton';
import RequestTypeAvatar from 'components/dumb/Avatar/RequestType';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import BadgeForAvatar from 'components/dumb/Badge/ForAvatar';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import TypographyDateSince from 'components/dumb/Typography/DateSince';

// COMPONENTS
export const RequestListItemSkeleton = (props) => (
  <ListItem {...props}>
    <ListItemAvatar>
      <Skeleton
        variant="circle"
        width={40}
        height={40}
      />
    </ListItemAvatar>
    <ListItemText
      primary={(
        <Skeleton
          component="span"
          variant="text"
          width="50%"
        />
      )}
      secondary={(
        <Skeleton
          component="span"
          variant="text"
          width="50%"
        />
      )}
    />
    <Box display="flex" flexDirection="column" alignItems="end">
      <Skeleton
        variant="text"
        width={30}
      />
    </Box>
  </ListItem>
);

function RequestListItem({ request, toRoute, t, isFetchingApplication, ...rest }) {
  const {
    producer: { application } = {},
    id,
    status,
    dpoComment,
    ownerComment,
    type,
    sentAt,
    updatedAt,
    blobCount = 0,
  } = useMemo(() => request || {}, [request]);

  const linkProps = useMemo(
    () => (isNil(toRoute) || isFetchingApplication ? {} : {
      to: generatePath(toRoute, { id }),
      button: true,
      component: Link,
    }),
    [id, isFetchingApplication, toRoute],
  );

  const duration = useMemo(
    () => moment(updatedAt).to(sentAt, true),
    [sentAt, updatedAt],
  );

  const { logoUri, name, mainDomain } = useMemo(
    () => application || {}, [application],
  );

  const primary = useMemo(
    () => {
      if (isNil(mainDomain) && isFetchingApplication) {
        return (
          <Skeleton
            variant="text"
            height={31}
            width="50%"
          />
        );
      }

      const noTypeSelected = type === UNKNOWN;
      return t('citizen:requests.list.primary', {
        appName: capitalize(name),
        type: noTypeSelected ? null : t(`citizen:requests.type.${type}`),
        separator: noTypeSelected ? '' : '-',
      });
    },
    [isFetchingApplication, mainDomain, name, t, type],
  );

  const secondary = useMemo(
    () => {
      if (!isNil(blobCount) && blobCount > 0) {
        return (
          <Trans i18nKey="citizen:requests.list.secondary.blobsReceived" values={{ count: blobCount, duration }}>
            <strong>{'Vous :\u00a0'}</strong>
            {blobCount}
            {' fichiers reçus après '}
            {duration}
          </Trans>
        );
      }
      switch (status) {
        case DRAFT:
          return (
            <Trans i18nKey="citizen:requests.list.secondary.draft">
              <strong>{'Vous :\u00a0'}</strong>
              {' à envoyer '}
            </Trans>
          );
        case OPEN: {
          const formatedSentAt = moment(sentAt).format(DATE_SHORT);
          return (
            <Trans i18nKey="citizen:requests.list.secondary.open" values={{ sentAt: formatedSentAt }}>
              <strong>{'Vous :\u00a0'}</strong>
              {' envoyé le '}
              {formatedSentAt}
            </Trans>
          );
        }
        case DONE: {
          const comment = t(`common:databox.dpoComment.${dpoComment}`);
          return (
            <Trans i18nKey="citizen:requests.list.secondary.done" values={{ comment, duration }}>
              <strong>{'Dpo :\u00a0'}</strong>
              {comment}
              {' après '}
              {duration}
            </Trans>
          );
        }
        case CLOSED: {
          const { comment, initiator } = !isEmpty(dpoComment)
            ? { comment: t(`common:databox.dpoComment.${dpoComment}`), initiator: 'dpo' }
            : { comment: t(`common:databox.ownerComment.${ownerComment}`, 'Archivée'), initiator: 'owner' };
          return (
            <Trans
              i18nKey={`citizen:requests.list.secondary.closed.${initiator}`}
              values={{ comment, duration }}
            >
              <strong>{`${initiator} :\u00a0`}</strong>
              {comment}
              {' après '}
              {duration}
            </Trans>
          );
        }
        default: return null;
      }
    },
    [blobCount, dpoComment, duration, ownerComment, sentAt, status, t],
  );

  return (
    <ListItem key={id} {...linkProps} {...omitTranslationProps(rest)}>
      <ListItemAvatar>
        <BadgeForAvatar badgeContent={<RequestTypeAvatar isSmall type={type} />}>
          <ApplicationAvatar
            src={logoUri}
            name={name}
          />
        </BadgeForAvatar>
      </ListItemAvatar>
      <ListItemText
        primary={primary}
        secondary={secondary}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block' }}
      />
      <Box display="flex" flexDirection="column" alignItems="end">
        {(blobCount > 0) && (
          <Box>
            <Chip color="secondary" label={blobCount} size="small" clickable />
          </Box>
        )}
        <TypographyDateSince date={updatedAt} variant="caption" color="textSecondary" />
      </Box>

    </ListItem>
  );
}

RequestListItem.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes),
  isFetchingApplication: PropTypes.bool,
  toRoute: PropTypes.string,
  t: PropTypes.func.isRequired,
};

RequestListItem.defaultProps = {
  request: null,
  toRoute: null,
  isFetchingApplication: false,
};

export default withTranslation('citizen')(RequestListItem);
