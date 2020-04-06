import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';

import DataboxSchema from 'store/schemas/Databox';

import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import Badge from '@material-ui/core/Badge';

import ApplicationImg from 'components/dumb/Application/Img';
import TypographyDateSince from 'components/dumb/Typography/DateSince';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import capitalize from '@misakey/helpers/capitalize';
import { DRAFT, OPEN, DONE, CLOSED } from 'constants/databox/status';
import { makeStyles } from '@material-ui/core';
import moment from 'moment';
import Skeleton from '@material-ui/lab/Skeleton';
import RequestTypeAvatar from 'components/dumb/Avatar/RequestType';
import { UNKNOWN } from 'constants/databox/type';


export const RequestListItemSkeleton = () => (
  <ListItem>
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

const useStyles = makeStyles(() => ({
  anchorOriginBottomRightRectangle: {
    bottom: 5,
    right: 5,
  },
}));

function RequestListItem({ request, toRoute, t, isFetchingApplication }) {
  const classes = useStyles();

  const {
    application,
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
          const formatedSentAt = moment(sentAt).format('ll');
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
    <ListItem key={id} {...linkProps}>
      <ListItemAvatar>
        <Badge
          classes={{ anchorOriginBottomRightRectangle: classes.anchorOriginBottomRightRectangle }}
          badgeContent={<RequestTypeAvatar isSmall type={type} />}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <ApplicationImg
            src={logoUri}
            applicationName={name}
          />
        </Badge>
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
