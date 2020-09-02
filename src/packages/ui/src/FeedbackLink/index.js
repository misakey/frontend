import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useImportTypeformCallback, { TYPEFORM_EMBED_URL } from '@misakey/hooks/useImportTypeformCallback';

import isNil from '@misakey/helpers/isNil';

import Link from '@material-ui/core/Link';

const LinkFeedback = ({ text, t, ...rest }) => {
  const clickOnTypeformLinkCallback = useImportTypeformCallback();
  const { pathname } = useLocation();

  const typeformHref = useMemo(
    () => `${t('components:footer.links.feedback.typeformUrl')}?where=${pathname}`,
    [pathname, t],
  );

  const script = document.querySelector(`script[src="${TYPEFORM_EMBED_URL}"]`);
  if (!isNil(script)) {
    script.remove();
  }

  return (
    <Link
      href={typeformHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={clickOnTypeformLinkCallback}
      // Typeform specific data configuration
      className="typeform-share link"
      data-hide-headers
      data-hide-footer
      data-submit-close-delay="3"
      data-mode="drawer_right"
      {...omitTranslationProps(rest)}
    >
      {text}
    </Link>
  );
};

LinkFeedback.propTypes = {
  text: PropTypes.string.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['components'])(LinkFeedback);
