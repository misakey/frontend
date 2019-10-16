import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';

import 'components/dumb/Footer/index.scss';

const Footer = ({ className, t }) => (
  <div className={clsx(className, 'footer')}>
    <Typography variant="body2">
      <Link
        href={t('footer.links.privacy.href')}
        color="textSecondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('footer.links.privacy.text')}
      </Link>
    </Typography>
    <span className="separator">-</span>
    <Typography variant="body2">
      <Link
        href={t('footer.links.tos.href')}
        color="textSecondary"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('footer.links.tos.text')}
      </Link>
    </Typography>
  </div>
);

Footer.propTypes = {
  t: PropTypes.func.isRequired,
  className: PropTypes.string,
};

Footer.defaultProps = {
  className: '',
};

export default withTranslation()(Footer);
