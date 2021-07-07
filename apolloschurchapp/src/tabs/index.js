import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationService, withTheme } from '@apollosproject/ui-kit';
import { useApolloClient } from '@apollo/client';

import { createFeatureFeedTab } from '@apollosproject/ui-connected';
import { checkOnboardingStatusAndNavigate } from '@apollosproject/ui-onboarding';
import { SearchButton } from '../ui/Search';
import { ONBOARDING_VERSION } from '../ui/Onboarding';
import Connect from './connect';
import tabBarIcon from './tabBarIcon';

const HeaderLogo = withTheme(({ theme }) => ({
  style: {
    height: theme.sizing.baseUnit * 1.5,
    width: '70%',
    resizeMode: 'contain',
  },
  source:
    theme.type === 'light'
      ? require('./wordmark.png')
      : require('./wordmark.dark.png'),
}))(Image);

const HeaderCenter = () => <HeaderLogo />;

const HeaderRight = () => {
  const navigation = useNavigation();
  return <SearchButton onPress={() => navigation.navigate('Search')} />;
};

// we nest stack inside of tabs so we can use all the fancy native header features
const HomeTab = createFeatureFeedTab({
  screenOptions: {
    headerHideShadow: true,
    headerCenter: HeaderCenter,
    headerRight: HeaderRight,
    headerLargeTitle: false,
  },
  tabName: 'Home',
  feedName: 'HOME',
});

const ExploreTab = createFeatureFeedTab({
  tabName: 'Explore',
  feedName: 'READ',
});

const WatchTab = createFeatureFeedTab({
  screenOptions: {
    headerRight: HeaderRight,
  },
  tabName: 'Watch',
  feedName: 'WATCH',
});

const { Navigator, Screen } = createBottomTabNavigator();

const TabNavigator = () => {
  const client = useApolloClient();
  // this is only used by the tab loaded first
  // if there is a new version of the onboarding flow,
  // we'll navigate there first to show new screens
  useEffect(
    () => {
      checkOnboardingStatusAndNavigate({
        client,
        navigation: NavigationService,
        latestOnboardingVersion: ONBOARDING_VERSION,
        navigateHome: false,
      });
    },
    [client]
  );
  return (
    <Navigator lazy>
      <Screen
        name="Home"
        component={HomeTab}
        options={{ tabBarIcon: tabBarIcon('house') }}
      />
      <Screen
        name="Watch"
        component={WatchTab}
        options={{ tabBarIcon: tabBarIcon('watch') }}
      />

      <Screen
        name="Explore"
        component={ExploreTab}
        options={{ tabBarIcon: tabBarIcon('explore') }}
      />
      <Screen
        name="Connect"
        component={Connect}
        options={{ tabBarIcon: tabBarIcon('connect') }}
      />
    </Navigator>
  );
};

export default TabNavigator;
