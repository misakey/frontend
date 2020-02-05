/* eslint-disable react/no-array-index-key, react/no-danger */
// react/no-danger because it is our own html but ins translation files (&nbsp;)
// this is actually the cleaner way to do it
// https://stackoverflow.com/questions/16038458/html-tags-in-i18next-translation
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

// HELPERS
export const getQuestionsItems = (t, transKey, nbOfQuestions) => {
  const items = [];

  for (let i = 0; i < nbOfQuestions; i += 1) {
    items.push({
      href: t(`${transKey}.href.${i}`, { interpolation: { escapeValue: false } }),
      text: t(`${transKey}.text.${i}`, { interpolation: { escapeValue: false } }),
    });
  }

  return items;
};

// HOOKS
const useStyles = makeStyles(() => ({
  justify: { textAlign: 'justify' },
}));

// @FIXME: make a generic hook
export const useQuestionsItems = (t, transKey, nbOfQuestions) => useMemo(
  () => getQuestionsItems(t, transKey, nbOfQuestions),
  [t, transKey, nbOfQuestions],
);

function ListQuestionsItemLink(props) {
  return (
    <ListItem
      button
      component="a"
      target="_blank"
      rel="nooppener noreferrer"
      {...props}
    />
  );
}

function ListQuestions({ breakpoints, items, justify }) {
  const classes = useStyles();

  return (
    <Grid component={List} container disablePadding>
      {items.map(({ text, href }, i) => (
        <Grid
          item
          component={ListQuestionsItemLink}
          key={`linkItem.${i}`}
          href={href}
          {...breakpoints}
        >
          <ListItemIcon>
            <HelpOutlineIcon />
          </ListItemIcon>
          <ListItemText
            primary={<span dangerouslySetInnerHTML={{ __html: text }} />}
            className={clsx({ [classes.justify]: justify })}
          />
        </Grid>
      ))}
    </Grid>
  );
}

ListQuestions.propTypes = {
  breakpoints: PropTypes.shape({
    xs: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    sm: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    md: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    lg: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
    xl: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  }),
  items: PropTypes.arrayOf(PropTypes.shape({
    href: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  })),
  justify: PropTypes.bool,
};

ListQuestions.defaultProps = {
  breakpoints: { sm: 6 },
  items: [],
  justify: false,
};

export default ListQuestions;
