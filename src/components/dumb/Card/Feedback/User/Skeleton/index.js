import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarUserSkeleton from 'components/dumb/Avatar/User/Skeleton';
import Skeleton from '@material-ui/lab/Skeleton';
import Card from 'components/dumb/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';
import Rating from '@material-ui/lab/Rating';
import Typography from '@material-ui/core/Typography';

// CONSTANTS
const MAX_SKELETONS = [1, 2, 3];

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardHeader: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  ratingIconFilled: {
    color: theme.palette.primary.main,
  },
  displayName: {
    marginLeft: theme.spacing(1),
  },
  rating: {
    marginRight: theme.spacing(1),
  },
  ratingAndDate: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
}));

// COMPONENTS
const UserFeedbackCardSkeleton = ({ count, ...props }) => {
  const classes = useStyles();

  const skeletons = useMemo(
    () => MAX_SKELETONS.slice(0, count),
    [count],
  );

  return skeletons.map((key) => (
    <Card key={key} {...props}>
      <CardHeader
        className={classes.cardHeader}
        avatar={<AvatarUserSkeleton />}
        title={<Skeleton variant="text" width={90} height={20} />}
        subheader={(
          <Box className={classes.ratingAndDate}>
            <Rating
              size="small"
              readOnly
              classes={{
                root: classes.rating,
                iconFilled: classes.ratingIconFilled,
              }}
            />
            <Typography component="div" color="textSecondary" noWrap>
              <Skeleton variant="text" width={80} />
            </Typography>
          </Box>
        )}
      />
      <CardContent>
        <Typography component="div" variant="body2" color="textPrimary">
          <Skeleton variant="text" height={20} />
        </Typography>
      </CardContent>
    </Card>
  ));
};

UserFeedbackCardSkeleton.propTypes = {
  count: PropTypes.number,
};

UserFeedbackCardSkeleton.defaultProps = {
  count: 0,
};

export default UserFeedbackCardSkeleton;
