```js
import React from 'react';
import Typography from '@material-ui/core/Typography';
import ScrollEffect from '@misakey/ui/ScrollEffect';

const LongTextExample = () => (
  <React.Suspense fallback="Loading...">
    <ScrollEffect propsOnTrigger={{ color: 'primary' }}>
      <Typography style={{ height: 100, overflow: 'auto' }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Sed lobortis dolor vitae felis accumsan pharetra.
        Nullam malesuada turpis ac ultricies facilisis.
        Aliquam quis massa congue, laoreet metus non, rutrum libero.
        Morbi sodales non lectus ut hendrerit. Suspendisse quis ultrices ipsum.
        Sed imperdiet urna augue, at volutpat purus bibendum id.
        Cras tincidunt ligula dui, eget suscipit massa pellentesque sit amet.
        Morbi in neque augue. Curabitur eleifend malesuada diam, sit amet tempus justo mollis sed.

        In consequat vitae dui quis fringilla.
        In nec aliquet ipsum. Aliquam at velit pulvinar, placerat nisl ac, egestas justo.
        Mauris facilisis ultricies felis, in tincidunt urna blandit ultricies.
        Praesent quis hendrerit ipsum, nec finibus arcu.
        Aenean magna nisi, interdum ut euismod vitae, lobortis sit amet ipsum.
        Aenean pretium sodales nisi id egestas.
      </Typography>
    </ScrollEffect>
  </React.Suspense>
);

  <LongTextExample />;
```
