import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import isEmpty from '@misakey/core/helpers/isEmpty';

import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  text: { width: '100%' },
  empty: { marginBottom: 'calc(20px + 0.30rem)' },
  offset: { marginTop: '-0.30rem' },
});

function GroupTitles({ offset, subtitle, subtitleProps, title, titleProps }) {
  const classes = useStyles();
  const empty = useMemo(() => isEmpty(subtitle), [subtitle]);

  return (
    <>
      <Title
        gutterBottom={titleProps.gutterBottom || false}
        {...titleProps}
        className={clsx(classes.text, titleProps.className, {
          [classes.empty]: empty,
          [classes.offset]: offset,
        })}
      >
        {title}
      </Title>
      {!empty && (
        <Subtitle
          {...subtitleProps}
          className={clsx(classes.text, subtitleProps.className)}
        >
          {subtitle}
        </Subtitle>
      )}
    </>
  );
}

GroupTitles.propTypes = {
  offset: PropTypes.bool,
  subtitle: PropTypes.node,
  subtitleProps: PropTypes.object,
  title: PropTypes.node.isRequired,
  titleProps: PropTypes.object,
};

GroupTitles.defaultProps = {
  offset: true,
  subtitle: '',
  subtitleProps: {},
  titleProps: {},
};

export default GroupTitles;
