import Typography from '@material-ui/core/Typography';
import ComponentProxy from '@misakey/ui/Component/Proxy';

const Subtitle = ComponentProxy(Typography);

Subtitle.defaultProps = {
  component: 'h3',
  variant: 'body2',
  color: 'textSecondary',
  gutterBottom: true,
};

export default Subtitle;
