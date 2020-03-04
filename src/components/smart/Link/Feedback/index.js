import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

import useImportTypeformCallback, { TYPEFORM_EMBED_URL } from 'hooks/useImportTypeformCallback';

import isNil from '@misakey/helpers/isNil';

import Link from '@material-ui/core/Link';

const LinkFeedback = ({ text, ...rest }) => {
  const clickOnTypeformLinkCallback = useImportTypeformCallback();
  const { pathname } = useLocation();

  const typeformHref = useMemo(
    () => `${window.env.TYPEFORM_URL}?where=${pathname}`,
    [pathname],
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
      {...rest}
    >
      {text}
    </Link>
  );
};

LinkFeedback.propTypes = {
  text: PropTypes.string.isRequired,
};

export default LinkFeedback;
