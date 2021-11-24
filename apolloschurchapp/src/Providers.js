import querystring from 'querystring';
import React from 'react';
import { useColorScheme } from 'react-native';
import ApollosConfig from '@apollosproject/config';
import { Providers, NavigationService } from '@apollosproject/ui-kit';
import { AuthProvider } from '@apollosproject/ui-auth';
import { AnalyticsProvider } from '@apollosproject/ui-analytics';
import { NotificationsProvider } from '@apollosproject/ui-notifications';
import { snakeCase } from 'lodash';
import {
  LiveProvider,
  ACCEPT_FOLLOW_REQUEST,
} from '@apollosproject/ui-connected';
import { checkOnboardingStatusAndNavigate } from '@apollosproject/ui-onboarding';
import RNAmplitude from 'react-native-amplitude-analytics';
import OneSignal from 'react-native-onesignal';

import { ONBOARDING_VERSION } from './ui/Onboarding';

import ClientProvider, { client } from './client';
import customTheme, { customIcons } from './theme';

const amplitude = new RNAmplitude(ApollosConfig.AMPLITUDE_API_KEY);

const trackOneSignal = ({ eventName, properties }) => {
  const acceptedEvents = [
    'PrayerPrayed',
    'PrayerAdded',
    'View Content',
    'Comment Added',
  ];
  if (!acceptedEvents.includes(eventName)) return;

  const tags = {};
  const timestamp = Math.floor(Date.now() / 1000);

  tags[snakeCase(`Last Date ${eventName}`)] = timestamp;

  if (eventName === 'View Content') {
    tags[snakeCase(`Last Date ${properties.parentChannel}`)] = timestamp;
  }

  OneSignal.sendTags(tags);
};

const AppProviders = (props) => {
  const islight = useColorScheme() === 'light';
  return (
    <ClientProvider {...props}>
      <NotificationsProvider
        oneSignalKey={ApollosConfig.ONE_SIGNAL_KEY}
        // TODO deprecated prop
        navigate={NavigationService.navigate}
        handleExternalLink={(url) => {
          const path = url.includes('app-link/')
            ? url.split('app-link/')[1]
            : url.split('//')[1];

          const [route, location] = path.split('/');
          if (route === 'content')
            NavigationService.navigate('ContentSingle', { itemId: location });
          if (route === 'nav') {
            const [cleanPath, query] = location.split('?');
            const args = querystring.parse(query);
            NavigationService.navigate(
              // turns "home" into "Home"
              cleanPath[0].toUpperCase() + cleanPath.substring(1),
              args
            );
          }
        }}
        actionMap={{
          // accept a follow request when someone taps "accept" in a follow request push notification
          acceptFollowRequest: ({ requestPersonId }) =>
            client.mutate({
              mutation: ACCEPT_FOLLOW_REQUEST,
              variables: { personId: requestPersonId },
            }),
        }}
      >
        <AuthProvider
          navigateToAuth={() => NavigationService.navigate('Auth')}
          navigate={NavigationService.navigate}
          closeAuth={() =>
            checkOnboardingStatusAndNavigate({
              client,
              navigation: NavigationService,
              latestOnboardingVersion: ONBOARDING_VERSION,
            })
          }
        >
          <AnalyticsProvider
            trackFunctions={[
              ({ eventName, properties }) => {
                amplitude.logEvent(eventName, properties);
              },
              trackOneSignal,
            ]}
          >
            <LiveProvider>
              <Providers
                themeInput={{
                  ...customTheme,
                  ...{
                    colors: islight
                      ? customTheme.lightColors
                      : customTheme.darkColors,
                  },
                }}
                iconInput={customIcons}
                {...props}
              />
            </LiveProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </NotificationsProvider>
    </ClientProvider>
  );
};

export default AppProviders;
