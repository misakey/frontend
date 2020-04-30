import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import makeStyles from '@material-ui/core/styles/makeStyles';

import CardHeader from '@material-ui/core/CardHeader';

import pick from '@misakey/helpers/pick';

import LinkHome from 'components/dumb/Link/Home';
import Logo from 'components/dumb/Logo';
import AvatarUser from '@misakey/ui/Avatar/User';

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardHeaderAction: {
    margin: theme.spacing(0),
  },
}));

// COMPONENTS
const CardHeaderAuth = ({ publics, ...props }) => {
  const classes = useStyles();

  return (
    <CardHeader
      action={(
        <AvatarUser {...pick(['identifier', 'displayName', 'avatarUri'], publics || {})} />
      )}
      avatar={(
        <LinkHome>
          <Logo width={100} />
        </LinkHome>
      )}
      classes={{ action: classes.cardHeaderAction }}
      {...props}
    />
  );
};

CardHeaderAuth.propTypes = {
  publics: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUri: PropTypes.string,
  }),
};

CardHeaderAuth.defaultProps = {
  publics: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  publics: state.screens.auth.publics,
});

export default connect(mapStateToProps, {})(CardHeaderAuth);
