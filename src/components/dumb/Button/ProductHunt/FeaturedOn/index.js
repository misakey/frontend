import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles(() => ({
  img: {
    width: '250px',
    height: '54px',
  },
}));

// COMPONENTS
const ButtonFeaturedOnProductHunt = () => {
  const classes = useStyles();

  return (
    <a
      href="https://www.producthunt.com/posts/misakey-1-0?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-misakey-1-0"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=263712&theme=dark"
        alt="Misakey 1.0 - Send encrypted documents & messages to anyone | Product Hunt Embed"
        className={classes.img}
        width="250"
        height="54"
      />
    </a>

  );
};

export default ButtonFeaturedOnProductHunt;
