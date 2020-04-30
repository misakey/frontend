import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import SimpleCard from 'components/dumb/Card/Simple';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import Subtitle from 'components/dumb/Typography/Subtitle';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles(() => ({
  typographyRoot: {
    fontWeight: 'bold',
  },
}));

// COMPONENTS
const CardContactTo = ({ application, t, ...rest }) => {
  const classes = useStyles();

  const { name, logoUri, mainDomain, dpoEmail } = useMemo(
    () => (isNil(application) ? {} : application),
    [application],
  );

  const applicationName = useMemo(
    () => name || mainDomain,
    [name, mainDomain],
  );

  return (
    <SimpleCard {...omitTranslationProps(rest)}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        width={1}
      >
        <Box mr={1}>
          <Typography>
            {t('citizen:contact.email.to.label')}
          </Typography>
        </Box>
        <ApplicationAvatar
          src={logoUri}
          name={applicationName}
        />
        <Box
          ml={2}
          display="flex"
          flexDirection="column"
        >
          <Typography noWrap variant="subtitle2" classes={{ root: classes.typographyRoot }}>
            {applicationName}
          </Typography>
          <Subtitle gutterBottom={false}>
            {dpoEmail}
          </Subtitle>
        </Box>
      </Box>
    </SimpleCard>
  );
};

CardContactTo.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  t: PropTypes.func.isRequired,
};

CardContactTo.defaultProps = {
  application: null,
};

export default withTranslation('citizen')(CardContactTo);
