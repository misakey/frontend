import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import moment from 'moment';

import { WORKSPACE } from 'constants/workspaces';
import { DATE_SHORT } from 'constants/formats/dates';

import ApplicationAvatar from 'components/dumb/Avatar/Application';
import RequestTypeAvatar from 'components/dumb/Avatar/RequestType';
import BadgeForAvatar from 'components/dumb/Badge/ForAvatar';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import Avatar from '@material-ui/core/Avatar';
import AvatarUser from '@misakey/ui/Avatar/User';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';
import DataboxSchema from 'store/schemas/Databox';
import Skeleton from '@material-ui/lab/Skeleton';


// COMPONENTS
const RequestSummary = ({ request, isFetching, t, ...rest }) => {
  const workspace = useLocationWorkspace();

  const {
    owner,
    producer: { application },
    type,
    sentAt,
  } = useMemo(
    () => request || { producer: {}, owner: {} },
    [request],
  );

  const { logoUri, name } = useMemo(() => application || {}, [application]);

  const primary = useMemo(
    () => {
      if (workspace === WORKSPACE.DPO) {
        return owner.email;
      }
      return name;
    }, [name, owner.email, workspace],
  );

  const secondary = useMemo(
    () => (!isNil(type) && !isNil(sentAt)
      ? `${t(`common:requests.type.${type}`)} ${t('common:date.of', { date: moment(sentAt).format(DATE_SHORT) })}`
      : null),
    [sentAt, t, type],
  );

  const avatarProps = useMemo(
    () => {
      if (workspace === WORKSPACE.DPO) {
        return {
          avatarUri: owner.avatarUri,
          displayName: owner.displayName,
          component: AvatarUser,
        };
      }
      return {
        src: logoUri,
        name,
        component: ApplicationAvatar,
      };
    },
    [logoUri, name, owner, workspace],
  );

  if (isFetching) {
    return (
      <Box display="flex" {...omitTranslationProps(rest)}>
        <Skeleton
          variant="circle"
          width={40}
          height={40}
        />
        <Skeleton
          component="span"
          variant="text"
          width={150}
        />
      </Box>
    );
  }

  return (
    <Box display="flex" {...omitTranslationProps(rest)}>
      <BadgeForAvatar badgeContent={<RequestTypeAvatar isSmall type={type} />}>
        <Avatar {...avatarProps} />
      </BadgeForAvatar>
      <Box display="flex" flexDirection="column" px={2}>
        <Typography>{primary}</Typography>
        <Typography color="textSecondary" variant="caption">{secondary}</Typography>
      </Box>
    </Box>
  );
};

RequestSummary.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes),
  isFetching: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

RequestSummary.defaultProps = {
  request: null,
  isFetching: false,
};

export default withTranslation('common')(RequestSummary);
