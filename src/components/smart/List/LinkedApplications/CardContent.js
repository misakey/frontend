import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import isNil from '@misakey/helpers/isNil';


import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';

import Skeleton from '@material-ui/lab/Skeleton';

import ApplicationListItem from 'components/dumb/ListItem/Application';
import BoxMessage from 'components/dumb/Box/Message';

function CardContent({ t, isFetching, error, list, isAuthenticated }) {
  const applicationLinks = useMemo(
    () => list.map((applicationLink) => ({
      ...applicationLink,
      to: generatePath(
        routes.citizen.application.vault,
        { mainDomain: applicationLink.application.mainDomain },
      ),
    })),
    [list],
  );

  if (!isAuthenticated) {
    return null;
  }
  if (isFetching) {
    return (
      <>
        <Skeleton
          variant="text"
          height={31}
        />
        <Skeleton
          variant="text"
          height={31}
        />
      </>
    );
  }
  if (error) {
    return (
      <BoxMessage type="error" mt={2}>
        <Typography>
          {t('linkedApplications.error')}
        </Typography>
      </BoxMessage>
    );
  }
  if (isNil(applicationLinks) || applicationLinks.length === 0) {
    return (
      <Typography>
        {t('linkedApplications.noApp')}
      </Typography>
    );
  }
  return (
    <List>
      {applicationLinks.map((applicationLink) => {
        const { application } = applicationLink;
        const to = generatePath(
          routes.citizen.application.vault,
          { mainDomain: application.mainDomain },
        );
        return (
          <ApplicationListItem
            key={application.mainDomain}
            application={application}
            button
            component={Link}
            to={to}
            secondaryLinkTo={to}
          />
        );
      })}
    </List>
  );
}

CardContent.propTypes = {
  t: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  list: PropTypes.arrayOf(PropTypes.object).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

CardContent.defaultProps = {
  error: undefined,
};

export default withTranslation(['components'])(CardContent);
