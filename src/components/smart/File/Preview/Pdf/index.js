import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import FILE_PROP_TYPES from '@misakey/ui/constants/file/proptypes';

import { getPage, getDocument } from '@misakey/helpers/pdf';
import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Box from '@material-ui/core/Box';
import IconButton from '@misakey/ui/IconButton';
import MobileStepper from '@material-ui/core/MobileStepper';

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

// CONSTANTS
const START_PAGE = 1;

// HOOKS
const useStyles = makeStyles((theme) => ({
  canvas: ({ maxHeight }) => ({
    maxWidth: '100%',
    maxHeight,
  }),
  container: {
    backgroundColor: theme.palette.background.message,
    color: theme.palette.white,
    borderRadius: theme.shape.borderRadius,
  },
  stepperRoot: {
    flexGrow: 1,
  },
  loader: {
    position: 'absolute',
  },
}));

// COMPONENTS
const PdfPreview = ({ file, fallbackView, maxHeight }) => {
  const classes = useStyles({ maxHeight });
  const theme = useTheme();
  const { t } = useTranslation(['components', 'common']);
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(START_PAGE);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const { numPages } = useSafeDestr(pdfDoc);

  const stepperVariant = useMemo(
    () => {
      if (isNil(numPages)) {
        return null;
      }
      return numPages < 5 ? 'dots' : 'text';
    },
    [numPages],
  );

  const canvasRef = useRef(null);
  const taskRef = useRef(null);

  const {
    blobUrl,
    isLoading,
    error,
  } = useMemo(() => file, [file]);

  const hasError = useMemo(() => !isNil(error), [error]);

  const displayPreview = useMemo(
    () => !hasError && !isLoading,
    [hasError, isLoading],
  );

  const onNext = useCallback(
    () => {
      if (!isNil(numPages)) {
        setPage((prevPage) => (prevPage < numPages ? prevPage + 1 : prevPage));
      }
    },
    [numPages, setPage],
  );

  const onPrev = useCallback(
    () => {
      if (!isNil(numPages)) {
        setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
      }
    },
    [numPages, setPage],
  );

  const loadPage = useCallback(
    async (pageNum, doc) => {
      setLoading(true);
      try {
        const { current: currentTask } = taskRef;
        if (currentTask) {
          currentTask.cancel();
        }
        const task = await getPage(pageNum, doc, canvasRef.current);
        taskRef.current = task;
        await taskRef.current;
        taskRef.current = null;
      } catch (e) {
        taskRef.current = null;
        enqueueSnackbar(t('components:filePreview.errors.pdf'), { variant: 'warning' });
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, t, setLoading],
  );

  const loadDocument = useCallback(
    async () => {
      try {
        const { current: currentTask } = taskRef;
        if (currentTask) {
          currentTask.cancel();
        }
        const doc = await getDocument(blobUrl);
        setPdfDoc(doc);
      } catch (e) {
        setPdfDoc(null);
        enqueueSnackbar(t('components:filePreview.errors.pdf'), { variant: 'warning' });
      }
    },
    [blobUrl, enqueueSnackbar, t],
  );

  useEffect(
    () => {
      if (displayPreview) {
        loadDocument();
      }
    },
    [displayPreview, loadDocument],
  );

  useEffect(
    () => {
      if (!isNil(pdfDoc) && !isNil(numPages)) {
        loadPage(page, pdfDoc);
      }
    },
    [page, pdfDoc, canvasRef, numPages, loadPage],
  );

  return (
    <Box display="flex" flexDirection="column">
      {displayPreview ? (
        <Box
          position="relative"
          width="100%"
          height="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          {loading && (
            <HourglassEmptyIcon color="primary" fontSize="large" className={classes.loader} />
          )}
          <canvas ref={canvasRef} className={classes.canvas} />
          <Box
            width="100%"
            display="flex"
            mt={1}
          >
            <MobileStepper
              classes={{ root: classes.stepperRoot }}
              variant={stepperVariant}
              steps={numPages || START_PAGE}
              position="static"
              activeStep={page - 1}
              nextButton={(
                <IconButton
                  size="small"
                  disabled={page === numPages || loading}
                  aria-label={t('common:next')}
                  onClick={onNext}
                >
                  {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
              )}
              backButton={(
                <IconButton
                  size="small"
                  disabled={page === START_PAGE || loading}
                  aria-label={t('common:previous')}
                  onClick={onPrev}
                >
                  {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              )}
            />
          </Box>
        </Box>
      ) : fallbackView}
    </Box>
  );
};

PdfPreview.propTypes = {
  file: PropTypes.shape(FILE_PROP_TYPES).isRequired,
  fallbackView: PropTypes.node,
  maxHeight: PropTypes.string,
};

PdfPreview.defaultProps = {
  maxHeight: '100%',
  fallbackView: null,
};

export default PdfPreview;
