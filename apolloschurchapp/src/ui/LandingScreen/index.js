import { StyleSheet } from 'react-native';
import { BackgroundView, styled } from '@apollosproject/ui-kit';

import { Landing } from '@apollosproject/ui-onboarding';

const Background = styled(({ theme }) => ({
  resizeMode: 'cover',
  ...StyleSheet.absoluteFill,
  width: '100%',
  height: '100%',
  // backgroundColor: theme.colors.tertiary,
}))(BackgroundView);

const LandingScreenSlide = ({ navigation }) => (
  <Landing
    onPressPrimary={() => navigation.push('Auth')}
    BackgroundComponent={<Background />}
    primaryNavText={"Let's go!"}
  />
);

export default LandingScreenSlide;
