import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import getSearchParams from '@misakey/helpers/getSearchParams';


import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import routes from 'routes';

import 'components/screens/Auth/Error/index.scss';

const AuthError = ({ location, t }) => {
  const searchParams = getSearchParams(location.search);

  return (
    <Paper className="Error">
      <Typography className="initialDescription">
        {t('screens:auth.error')}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        to={routes._}
        component={Link}
      >
        Go to home
      </Button>
      <List>
        <ListItem>
          <ListItemText primary={(
            <Typography>
              <strong>Error code: </strong>
              {searchParams.error_code}
            </Typography>
          )}
          />
        </ListItem>
        <ListItem>
          <ListItemText primary={(
            <Typography>
              <strong>Error description: </strong>
              {searchParams.error_description}
            </Typography>
          )}
          />
        </ListItem>
        <ListItem>
          <ListItemText primary={(
            <Typography>
              <strong>Error location: </strong>
              {searchParams.error_location}
            </Typography>
          )}
          />
        </ListItem>
      </List>
    </Paper>
  );
};

AuthError.propTypes = {
  location: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};


export default withTranslation('screens')(AuthError);
