import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import invertObj from '@misakey/helpers/invertObj';
import max from '@misakey/helpers/max';
import min from '@misakey/helpers/min';
import propOr from '@misakey/helpers/propOr';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { useTranslation } from 'react-i18next';

import MobileStepper from '@material-ui/core/MobileStepper';
import IconButton from '@misakey/ui/IconButton';
import DialogFilePreview from 'components/smart/Dialog/FilePreview';
import Box from '@material-ui/core/Box';

// import PrintIcon from '@material-ui/icons/Print';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

// CONSTANTS
const APP_BAR_PROPS = {
  elevation: 0,
};

const PREVIEW_MAX_HEIGHT = `calc(100vh - ${APPBAR_HEIGHT}px - 16px)`;

// HOOKS
const useStyles = makeStyles((theme) => ({
  stepperRoot: {
    position: 'absolute',
    bottom: 0,
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.background.darker,
    color: theme.palette.getContrastText(theme.palette.background.darker),
  },
  stepperDots: {
    paddingBottom: theme.spacing(1),
  },
  stepperDot: {
    backgroundColor: theme.palette.darker.action.disabled,
  },
  stepperDotActive: {
    backgroundColor: theme.palette.primary.main,
  },
  paper: {
    marginTop: APPBAR_HEIGHT,
  },
  floatBox: {
    borderRadius: '50%',
    '@media (hover: none)': {
      width: 'auto',
      height: 'auto',
    },
    [theme.breakpoints.down('lg')]: {
      width: 200,
      height: 200,
    },
    [theme.breakpoints.down('sm')]: {
      width: 96,
      height: 96,
    },
    [theme.breakpoints.only('xs')]: {
      width: 'auto',
      height: 'auto',
    },
  },
  floatButton: {
    width: '100%',
    height: '100%',
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      '&:hover': {
        backgroundColor: theme.palette.background.paper,
      },
    },
  },
}));

// COMPONENTS
function FilePreviewCarousel({ open,
  onChange,
  file,
  byPagination, itemCount, loadMoreItems,
  id,
  ...props
}) {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation('common');

  const byPaginationIndexes = useMemo(
    () => (isNil(byPagination)
      ? {}
      : invertObj(byPagination)),
    [byPagination],
  );

  const [minIndex, maxIndex] = useMemo(
    () => {
      const byPaginationNumbers = isNil(byPagination)
        ? []
        : Object.keys(byPagination).map(Number);
      return [min(byPaginationNumbers), max(byPaginationNumbers)];
    },
    [byPagination],
  );

  const activeStep = useMemo(
    () => Number(propOr(0, id, byPaginationIndexes)),
    [id, byPaginationIndexes],
  );

  const stepperVariant = useMemo(
    () => (itemCount < 5
      ? 'dots'
      : 'text'),
    [itemCount],
  );

  const shouldLoadPrevNext = useMemo(
    () => isFunction(loadMoreItems)
    && !isNil(byPagination)
    && !isNil(itemCount)
    && open
    && !isNil(minIndex)
    && !isNil(maxIndex)
    && ((activeStep === minIndex && minIndex > 0)
      || (activeStep === maxIndex && maxIndex < itemCount)),
    [
      loadMoreItems, byPagination, itemCount,
      open, activeStep, minIndex, maxIndex,
    ],
  );

  const loadPrevNext = useCallback(
    () => {
      const hasPrev = activeStep !== 0;
      const hasNext = activeStep !== itemCount - 1;
      if (!hasPrev && !hasNext) {
        return Promise.resolve();
      }
      const offset = hasPrev ? activeStep - 1 : activeStep + 1;
      if (hasNext && hasPrev) {
        return loadMoreItems({ offset, limit: 3 });
      }
      return loadMoreItems({ offset, limit: 1 });
    },
    [activeStep, itemCount, loadMoreItems],
  );

  useFetchEffect(loadPrevNext, { shouldFetch: shouldLoadPrevNext });

  const handleNext = useCallback(
    () => onChange(activeStep + 1),
    [onChange, activeStep],
  );

  const handleBack = useCallback(
    () => onChange(activeStep - 1),
    [onChange, activeStep],
  );

  return (
    <DialogFilePreview
      open={open}
      title={(
        <MobileStepper
          elevation={0}
          classes={{
            root: classes.stepperRoot,
            dots: classes.stepperDots,
            dot: classes.stepperDot,
            dotActive: classes.stepperDotActive,
          }}
          variant={stepperVariant}
          steps={itemCount}
          position="static"
          activeStep={activeStep}
        />
      )}
      appBarProps={APP_BAR_PROPS}
      file={file}
      classes={{ paper: classes.paper }}
      maxHeight={PREVIEW_MAX_HEIGHT}
      {...props}
    >
      <Box
        position="absolute"
        display="flex"
        justifyContent="center"
        alignItems="center"
        left={0}
        classes={{ root: classes.floatBox }}
      >
        <IconButton
          aria-label={t('common:previous')}
          color="darker"
          onClick={handleBack}
          disabled={activeStep === 0}
          className={classes.floatButton}
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
        </IconButton>
      </Box>
      <Box
        position="absolute"
        display="flex"
        justifyContent="center"
        alignItems="center"
        right={0}
        classes={{ root: classes.floatBox }}
      >
        <IconButton
          aria-label={t('common:next')}
          color="darker"
          onClick={handleNext}
          disabled={activeStep === itemCount - 1}
          className={classes.floatButton}
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />}
        </IconButton>
      </Box>
    </DialogFilePreview>
  );
}


FilePreviewCarousel.propTypes = {
  open: PropTypes.bool.isRequired,
  file: PropTypes.shape(DecryptedFileSchema.propTypes),
  index: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  byPagination: PropTypes.object,
  itemCount: PropTypes.number,
  loadMoreItems: PropTypes.func,
  id: PropTypes.string,
};

FilePreviewCarousel.defaultProps = {
  file: null,
  index: null,
  byPagination: null,
  itemCount: null,
  loadMoreItems: null,
  id: null,
};

export default FilePreviewCarousel;
