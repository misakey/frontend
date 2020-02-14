import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

const Footer = ({ t, typographyProps, ...rest }) => (
  <Box mt={2} mb={1} {...omitTranslationProps(rest)} mx={1}>
    <Typography variant="body2" align="center" {...typographyProps}>
      <Link
        href={t('footer.links.privacy.href')}
        color="secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('footer.links.privacy.text')}
      </Link>
      {' - '}
      <Link
        href={t('footer.links.tos.href')}
        color="secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('footer.links.tos.text')}
      </Link>
      {' - '}
      <Link
        href={t('footer.links.sources.href')}
        color="secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('footer.links.sources.text')}
      </Link>
      {' - '}
      <Link
        href={t('footer.links.about.href')}
        color="secondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('footer.links.about.text')}
      </Link>
    </Typography>
  </Box>
);

Footer.propTypes = {
  t: PropTypes.func.isRequired,
  typographyProps: PropTypes.object,
};

Footer.defaultProps = {
  typographyProps: {},
};

export default withTranslation()(Footer);
