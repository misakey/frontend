import React, { useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';

import { FEEDBACK } from '@misakey/ui/constants/emails';
import { ACCORDION_MIN_HEIGHT } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Link from '@material-ui/core/Link';
import LinkFeedback from '@misakey/ui/Link/Feedback';
import Logo from '@misakey/ui/Logo';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@misakey/ui/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// min height + border
export const FOOTER_HEIGHT = ACCORDION_MIN_HEIGHT + 2;

// HOOKS
const useStyles = makeStyles((theme) => ({
  logoRoot: {
    marginLeft: theme.spacing(1),
    height: `calc(${theme.typography.body2.fontSize} * ${theme.typography.body2.lineHeight})`,
  },
  expansionPanelRoot: {
    backgroundColor: theme.palette.background.default,
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
  },
  itemSpaced: {
    margin: theme.spacing(1, 0),
  },
}));

// COMPONENTS
const Footer = ({
  title, typographyProps,
  ContainerComponent, containerProps,
  ...rest
}) => {
  const classes = useStyles();

  const { t } = useTranslation('components');

  const [expanded, setExpanded] = useState(false);

  const onExpandChange = useCallback(
    (event, value) => {
      setExpanded(value);
    },
    [setExpanded],
  );

  const onEntered = useCallback(
    (e) => {
      e.scrollIntoView();
    },
    [],
  );

  return (
    <Accordion
      classes={{ root: classes.expansionPanelRoot }}
      variant="outlined"
      expanded={expanded}
      onChange={onExpandChange}
      TransitionProps={{ onEntered }}
      {...rest}
    >
      <ContainerComponent {...containerProps}>
        <AccordionSummary
          classes={{
            root: classes.expansionPanelSummaryRoot,
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Subtitle gutterBottom={false} noWrap>
            {title || t('components:footer.title')}
          </Subtitle>
          <Logo className={classes.logoRoot} />
        </AccordionSummary>
      </ContainerComponent>
      <AccordionDetails>
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
                  href={t('components:footer.links.site.href')}
                  color="textSecondary"
                  variant="body2"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...typographyProps}
                >
                  {t('components:footer.links.site.text')}
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
                  details={(
                    <Trans i18nKey="components:footer.links.feedback.details">
                      Send us an email at
                      <Link href={`mailto:${FEEDBACK}`}>{FEEDBACK}</Link>
                      ,
                      we&apos;ll get back to you shortly
                    </Trans>
                  )}
                  variant="body2"
                  {...typographyProps}
                />
              </Grid>
            </Grid>
          </Grid>
        </ContainerComponent>
      </AccordionDetails>
    </Accordion>
  );
};

Footer.propTypes = {
  title: PropTypes.string,
  typographyProps: PropTypes.object,
  ContainerComponent: PropTypes.elementType,
  containerProps: PropTypes.object,
};

Footer.defaultProps = {
  title: '',
  typographyProps: {},
  ContainerComponent: Box,
  containerProps: {},
};

export default Footer;
