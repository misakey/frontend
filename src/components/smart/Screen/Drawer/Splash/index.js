import React from 'react';
import ScreenDrawer from 'components/smart/Screen/Drawer';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

function SplashScreenDrawer(props) {
  return (
    <ScreenDrawer
      drawerChildren={() => <SplashScreenWithTranslation />}
      {...props}
    >
      <SplashScreenWithTranslation />
    </ScreenDrawer>
  );
}


export default SplashScreenDrawer;
