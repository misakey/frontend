import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Link from '@material-ui/core/Link';
import LinkFeedback from 'components/smart/Link/Feedback';
import Logo from 'components/dumb/Logo';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { FAB_WIDTH, FAB_RIGHT } from 'components/smart/Search/Applications/Fab';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// CONSTANTS
const XS_CONTAINER_SPACING = 16;
const SM_CONTAINER_SPACING = 24;
const MD_CONTAINER_SPACING = 32;

// @FIXME: remove dependency on Container + FAB
const FAB_OUT = 960 + FAB_WIDTH;

// HOOKS
const useStyles = makeStyles((theme) => ({
  logoRoot: {
    marginLeft: theme.spacing(1),
    height: `calc(${theme.typography.body2.fontSize} * ${theme.typography.body2.lineHeight})`,
  },
  expansionPanelRoot: {
    boxSizing: 'border-box',
    '&.Mui-expanded': {
      marginTop: theme.spacing(0),
    },
    '&:before': {
      display: 'none',
    },
  },
  expansionPanelSummaryRoot: {
    padding: theme.spacing(0),
    '&.Mui-expanded': {
      minHeight: 8 * 6,
    },
    // marginRight = right spacing of FAB + FAB_WIDTH - CONTAINER_SPACING
    [theme.breakpoints.only('xs')]: {
      marginRight: ({ FABPadded }) => (FABPadded
        ? theme.spacing(FAB_RIGHT) + FAB_WIDTH - XS_CONTAINER_SPACING
        : null),
    },
    [theme.breakpoints.only('sm')]: {
      marginRight: ({ FABPadded }) => (FABPadded
        ? theme.spacing(FAB_RIGHT) + FAB_WIDTH - SM_CONTAINER_SPACING
        : null),
    },
    // specific breakpoint when there is a FAB, to add padding when FAB floats over footer
    [theme.breakpoints.between('md', FAB_OUT)]: {
      marginRight: ({ FABPadded }) => (FABPadded
        ? theme.spacing(FAB_RIGHT) + FAB_WIDTH - MD_CONTAINER_SPACING
        : null),
    },
  },
  expansionPanelDetailsRoot: ({ FABPadded }) => ({
    // marginRight = right spacing of FAB + FAB_WIDTH - CONTAINER_SPACING
    [theme.breakpoints.only('xs')]: {
      marginRight: FABPadded ? theme.spacing(FAB_RIGHT) + FAB_WIDTH - XS_CONTAINER_SPACING : null,
    },
    [theme.breakpoints.only('sm')]: {
      marginRight: FABPadded ? theme.spacing(FAB_RIGHT) + FAB_WIDTH - SM_CONTAINER_SPACING : null,
    },
    // specific breakpoint when there is a FAB, to add padding when FAB floats over footer
    [theme.breakpoints.between('md', FAB_OUT)]: {
      marginRight: FABPadded
        ? theme.spacing(FAB_RIGHT) + FAB_WIDTH - MD_CONTAINER_SPACING
        : null,
    },
  }),
  itemSpaced: {
    margin: theme.spacing(1, 0),
  },
}));

// COMPONENTS
const Footer = ({ t, typographyProps, FABPadded, ContainerComponent, containerProps, ...rest }) => {
  const classes = useStyles({ FABPadded });

  const [expanded, setExpanded] = useState(false);

  const onExpandChange = useCallback(
    (event, value) => {
      setExpanded(value);
    },
    [setExpanded],
  );

  const onEntered = useCallback(
    () => {
      window.scrollTo(0, document.body.scrollHeight);
    },
    [],
  );

  return (
    <ExpansionPanel
      classes={{ root: classes.expansionPanelRoot }}
      variant="outlined"
      expanded={expanded}
      onChange={onExpandChange}
      TransitionProps={{ onEntered }}
      {...omitTranslationProps(rest)}
    >
      <ContainerComponent {...containerProps}>
        <ExpansionPanelSummary
          classes={{
            root: classes.expansionPanelSummaryRoot,
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Subtitle noWrap>
            {t('components:footer.title')}
          </Subtitle>
          <Logo className={classes.logoRoot} />
        </ExpansionPanelSummary>
      </ContainerComponent>
      <ExpansionPanelDetails
        classes={{ root: classes.expansionPanelDetailsRoot }}
      >
        <ContainerComponent {...containerProps}>
          <Grid container>
            <Grid container item xs={12}>
              <Grid
                item
                className={classes.itemSpaced}
                xs={12}
                sm={4}
              >
                <Link
                  href={t('components:footer.links.tos.href')}
                  color="textSecondary"
                  variant="body2"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...typographyProps}
                >
                  {t('components:footer.links.tos.text')}
                </Link>
              </Grid>
              <Grid
                item
                className={classes.itemSpaced}
                xs={12}
                sm={4}
              >
                <Link
                  href={t('components:footer.links.blog.href')}
                  color="textSecondary"
                  variant="body2"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...typographyProps}
                >
                  {t('components:footer.links.blog.text')}
                </Link>
              </Grid>
              <Grid
                item
                className={classes.itemSpaced}
                xs={12}
                sm={4}
              >
                <Link
                  href={t('components:footer.links.sources.href')}
                  color="textSecondary"
                  variant="body2"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...typographyProps}
                >
                  {t('components:footer.links.sources.text')}
                </Link>
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid
                item
                className={classes.itemSpaced}
                xs={12}
                sm={4}
              >
                <Link
                  href={t('components:footer.links.privacy.href')}
                  color="textSecondary"
                  variant="body2"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...typographyProps}
                >
                  {t('components:footer.links.privacy.text')}
                </Link>
              </Grid>
              <Grid
                item
                className={classes.itemSpaced}
                xs={12}
                sm={4}
              >
                <Link
                  href={t('components:footer.links.about.href')}
                  color="textSecondary"
                  variant="body2"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...typographyProps}
                >
                  {t('components:footer.links.about.text')}
                </Link>
              </Grid>
              <Grid
                item
                className={classes.itemSpaced}
                xs={12}
                sm={4}
              >
                <LinkFeedback
                  text={t('components:footer.links.feedback.text')}
                  color="secondary"
                  variant="body2"
                  {...typographyProps}
                />
              </Grid>
            </Grid>
          </Grid>
        </ContainerComponent>

      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

Footer.propTypes = {
  t: PropTypes.func.isRequired,
  typographyProps: PropTypes.object,
  FABPadded: PropTypes.bool,
  ContainerComponent: PropTypes.elementType,
  containerProps: PropTypes.object,
};

Footer.defaultProps = {
  typographyProps: {},
  FABPadded: false,
  ContainerComponent: Box,
  containerProps: {},
};

export default withTranslation('components')(Footer);
