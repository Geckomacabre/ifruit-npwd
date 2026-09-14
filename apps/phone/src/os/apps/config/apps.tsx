import React from 'react';
import { blue, common, grey, purple } from '@mui/material/colors';
import { DialerApp } from '@apps/dialer/components/DialerApp';
import { ContactsApp } from '@apps/contacts/components/ContactsApp';
import { CalculatorApp } from '@apps/calculator/components/CalculatorApp';
import { SettingsApp } from '@apps/settings/components/SettingsApp';
import { MessagesApp } from '@apps/messages/components/MessagesApp';
import { ExampleAppWrapper } from '@apps/example/components/ExampleAppWrapper';
import { MarketplaceApp } from '@apps/marketplace/components/MarketplaceApp';
import { NotesApp } from '@apps/notes/NotesApp';
import CameraApp from '@apps/camera/components/CameraApp';
import { AppRoute } from '../components/AppRoute';

import {
  MESSAGES_APP_PRIMARY_COLOR,
  MESSAGES_APP_TEXT_COLOR,
} from '@apps/messages/messages.theme';
import {
  CONTACTS_APP_PRIMARY_COLOR,
  CONTACTS_APP_TEXT_COLOR,
} from '@apps/contacts/contacts.theme';
import {
  MARKETPLACE_APP_PRIMARY_COLOR,
  MARKETPLACE_APP_ICON_COLOR,
} from '@apps/marketplace/marketplace.theme';
import { NOTES_APP_ICON_COLOR, NOTES_APP_PRIMARY_COLOR } from '@apps/notes/notes.theme';
import { DIALER_APP_PRIMARY_COLOR, DIALER_APP_TEXT_COLOR } from '@apps/dialer/dialer.theme';
import {
  TWITTER_APP_PRIMARY_COLOR,
  TWITTER_APP_TEXT_COLOR,
} from '@apps/twitter/twitter.theme';
import { MATCH_APP_PRIMARY_COLOR, MATCH_APP_TEXT_COLOR } from '@apps/match/match.theme';
import { SvgIconProps, Theme } from '@mui/material';
import { INotificationIcon } from '@os/notifications/providers/NotificationsProvider';
import { BrowserApp } from '@apps/browser/components/BrowserApp';
import { MatchApp } from '@apps/match/components/MatchApp';
import LifeInvaderContainer from '@apps/twitter/components/TwitterContainer';
import { IPhoneSettings } from '@typings/settings';
import { i18n } from 'i18next';
import {
  DARKCHAT_APP_PRIMARY_COLOR,
  DARKCHAT_APP_TEXT_COLOR,
} from '@apps/darkchat/darkchat.theme';
import DarkChatApp from '../../../apps/darkchat/DarkChatApp';
import DialerAppIcon from '../icons/material/app/DIALER';
import BrowserIcon from '../icons/material/app/BROWSER';
import MessagesIcon from '../icons/material/app/MESSAGES';
import DarkchatIcon from '../icons/material/app/DARKCHAT';
import ContactIcon from '../icons/material/app/CONTACTS';
import Calculator from '../icons/material/app/CALCULATOR';
import SettingsIcon from '../icons/material/app/SETTINGS';
import MatchIcon from '../icons/material/app/MATCH';
import TwitterIcon from '../icons/material/app/TWITTER';
import MarketplaceIcon from '../icons/material/app/MARKETPLACE';
import NotesIcon from '../icons/material/app/NOTES';
import Camera from '../icons/material/app/CAMERA';
import ExampleIcon from '../icons/material/app/EXAMPLE';
import WalletIcon from '../icons/material/app/WALLET';
import { WalletApp } from '@apps/wallet/WalletApp';
import { WALLET_APP_PRIMARY_COLOR } from '@apps/wallet/wallet.theme';
import EmailIcon from '../icons/material/app/EMAIL';
import { MailApp } from '@apps/mail/MailApp';
import { MAIL_APP_PRIMARY_COLOR } from '@apps/mail/mail.theme';
import ClockIcon from '../icons/material/app/CLOCK';
import { ClockApp } from '@apps/clock/ClockApp';
import { CLOCK_APP_PRIMARY_COLOR } from '@apps/clock/clock.theme';
import WeatherIcon from '../icons/material/app/WEATHER';
import { WeatherApp } from '@apps/weather/WeatherApp';
import { WEATHER_APP_PRIMARY_COLOR } from '@apps/weather/weather.theme';
import GarageIcon from '../icons/material/app/GARAGE';
import { GarageApp } from '@apps/garage/GarageApp';
import { GARAGE_APP_PRIMARY_COLOR } from '@apps/garage/garage.theme';
import ServicesIcon from '../icons/material/app/SERVICES';
import { ServicesApp } from '@apps/services/ServicesApp';
import { SERVICES_APP_PRIMARY_COLOR } from '@apps/services/services.theme';
import VoiceMemosIcon from '../icons/material/app/VOICEMEMOS';
import { VoiceMemosApp } from '@apps/voicememos/VoiceMemosApp';
import { VOICE_MEMOS_APP_PRIMARY_COLOR } from '@apps/voicememos/voicememos.theme';
import PagesIcon from '../icons/material/app/PAGES';
import { PagesApp } from '@apps/pages/PagesApp';
import { PAGES_APP_PRIMARY_COLOR } from '@apps/pages/pages.theme';
import AppStoreIcon from '../icons/material/app/APPSTORE';
import InstaPicIcon from '../icons/material/app/INSTAPIC';
import { InstaPicApp } from '@apps/instapic/InstaPicApp';
import CryptoIcon from '../icons/material/app/CRYPTO';
import { CryptoApp } from '@apps/crypto/CryptoApp';
import SnarfIcon from '../icons/material/app/SNARF';
import RydemeIcon from '../icons/material/app/RYDEME';
import { SnarfApp } from '@apps/gigs/SnarfApp';
import { RydemeApp } from '@apps/gigs/RydemeApp';
import { AppStoreApp } from '@apps/appstore/AppStoreApp';
import { APPSTORE_APP_PRIMARY_COLOR } from '@apps/appstore/appstore.theme';

export interface IAppConfig {
  id: string;
  nameLocale: string;
  backgroundColor: string;
  color: string;
  path: string;
  disable?: boolean;
  /** Can be installed/removed from the App Store. Undefined settings.installedApps means "everyone already has it". */
  removable?: boolean;
  storeDescription?: string;
  storeSizeKb?: number;
  Route: React.FC<{ settings?: IPhoneSettings; i18n?: i18n; theme?: Theme }>;
  icon: JSX.Element;
}

export type IApp = IAppConfig & {
  notification: INotificationIcon;
  icon: JSX.Element;
  isDisabled: boolean;
  notificationIcon: JSX.Element;
  NotificationIcon: React.FC<SvgIconProps>;
  Icon?: React.FC<SvgIconProps>;
  theme?: any;
};

export const APPS: IAppConfig[] = [
  {
    id: 'DIALER',
    nameLocale: 'APPS_DIALER',
    backgroundColor: DIALER_APP_PRIMARY_COLOR,
    icon: <DialerAppIcon />,
    color: DIALER_APP_TEXT_COLOR,
    path: '/phone',
    Route: () => <AppRoute id="DIALER" path="/phone" component={DialerApp} emitOnOpen={false} />,
  },
  {
    id: 'BROWSER',
    nameLocale: 'BROWSER.NAME',
    backgroundColor: blue['300'],
    path: '/browser',
    icon: <BrowserIcon />,
    color: common.white,
    Route: () => (
      <AppRoute id="BROWSER" path="/browser" component={BrowserApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'MESSAGES',
    nameLocale: 'APPS_MESSAGES',
    icon: <MessagesIcon />,
    backgroundColor: MESSAGES_APP_PRIMARY_COLOR,
    color: MESSAGES_APP_TEXT_COLOR,
    path: '/messages',
    Route: () => (
      <AppRoute id="MESSAGES" path="/messages" component={MessagesApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'DARKCHAT',
    nameLocale: 'APPS_DARKCHAT',
    icon: <DarkchatIcon />,
    backgroundColor: DARKCHAT_APP_PRIMARY_COLOR,
    color: DARKCHAT_APP_TEXT_COLOR,
    path: '/darkchat',
    removable: true,
    storeDescription: 'Anonymous chat rooms',
    storeSizeKb: 98500,
    Route: () => (
      <AppRoute id="DARKCHAT" path="/darkchat" component={DarkChatApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'CONTACTS',
    nameLocale: 'APPS_CONTACTS',
    backgroundColor: CONTACTS_APP_PRIMARY_COLOR,
    icon: <ContactIcon />,
    color: CONTACTS_APP_TEXT_COLOR,
    path: '/contacts',
    Route: () => (
      <AppRoute id="CONTACTS" path="/contacts" component={ContactsApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'CALCULATOR',
    nameLocale: 'APPS_CALCULATOR',
    icon: <Calculator />,
    backgroundColor: purple[500],
    color: grey[50],
    path: '/calculator',
    Route: () => (
      <AppRoute id="CALCULATOR" path="/calculator" component={CalculatorApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'SETTINGS',
    nameLocale: 'APPS_SETTINGS',
    icon: <SettingsIcon />,
    backgroundColor: '#383838',
    color: grey[50],
    path: '/settings',
    Route: () => (
      <AppRoute id="SETTINGS" path="/settings" component={SettingsApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'MATCH',
    nameLocale: 'APPS_MATCH',
    icon: <MatchIcon />,
    backgroundColor: MATCH_APP_PRIMARY_COLOR,
    color: MATCH_APP_TEXT_COLOR,
    path: '/match',
    removable: true,
    storeDescription: 'Meet new people',
    storeSizeKb: 187500,
    Route: () => <AppRoute id="MATCH" path="/match" component={MatchApp} emitOnOpen={false} />,
  },
  {
    id: 'TWITTER',
    nameLocale: 'APPS_TWITTER',
    icon: <TwitterIcon />,
    backgroundColor: TWITTER_APP_PRIMARY_COLOR,
    color: TWITTER_APP_TEXT_COLOR,
    path: '/twitter',
    removable: true,
    storeDescription: 'Live news, sports and chat',
    storeSizeKb: 256700,
    Route: () => (
      <AppRoute id="TWITTER" path="/twitter" component={LifeInvaderContainer} emitOnOpen={false} />
    ),
  },
  {
    id: 'MARKETPLACE',
    nameLocale: 'APPS_MARKETPLACE',
    icon: <MarketplaceIcon />,
    backgroundColor: MARKETPLACE_APP_PRIMARY_COLOR,
    color: MARKETPLACE_APP_ICON_COLOR,
    path: '/marketplace',
    removable: true,
    storeDescription: 'Buy and sell items',
    storeSizeKb: 84400,
    Route: () => (
      <AppRoute
        id="MARKETPLACE"
        path="/marketplace"
        component={MarketplaceApp}
        emitOnOpen={false}
      />
    ),
  },
  {
    id: 'NOTES',
    nameLocale: 'APPS_NOTES',
    icon: <NotesIcon />,
    backgroundColor: NOTES_APP_PRIMARY_COLOR,
    color: NOTES_APP_ICON_COLOR,
    path: '/notes',
    Route: () => <AppRoute id="NOTES" path="/notes" component={NotesApp} emitOnOpen={false} />,
  },
  {
    id: 'CAMERA',
    nameLocale: 'APPS_CAMERA',
    icon: <Camera />,
    backgroundColor: grey['A400'],
    color: common.white,
    path: '/camera',
    Route: () => <AppRoute id="CAMERA" path="/camera" component={CameraApp} emitOnOpen={false} />,
  },
  {
    id: 'WALLET',
    nameLocale: 'APPS_WALLET',
    icon: <WalletIcon />,
    backgroundColor: WALLET_APP_PRIMARY_COLOR,
    color: common.white,
    path: '/wallet',
    Route: () => <AppRoute id="WALLET" path="/wallet" component={WalletApp} emitOnOpen={false} />,
  },
  {
    id: 'EMAIL',
    nameLocale: 'APPS_EMAIL',
    icon: <EmailIcon />,
    backgroundColor: MAIL_APP_PRIMARY_COLOR,
    color: common.white,
    path: '/mail',
    Route: () => <AppRoute id="EMAIL" path="/mail" component={MailApp} emitOnOpen={false} />,
  },
  {
    id: 'CLOCK',
    nameLocale: 'APPS_CLOCK',
    icon: <ClockIcon />,
    backgroundColor: CLOCK_APP_PRIMARY_COLOR,
    color: common.white,
    path: '/clock',
    Route: () => <AppRoute id="CLOCK" path="/clock" component={ClockApp} emitOnOpen={false} />,
  },
  {
    id: 'WEATHER',
    nameLocale: 'APPS_WEATHER',
    icon: <WeatherIcon />,
    backgroundColor: WEATHER_APP_PRIMARY_COLOR,
    color: common.white,
    path: '/weather',
    Route: () => <AppRoute id="WEATHER" path="/weather" component={WeatherApp} emitOnOpen={false} />,
  },
  {
    id: 'GARAGE',
    nameLocale: 'APPS_GARAGE',
    icon: <GarageIcon />,
    backgroundColor: GARAGE_APP_PRIMARY_COLOR,
    color: common.white,
    path: '/garage',
    Route: () => <AppRoute id="GARAGE" path="/garage" component={GarageApp} emitOnOpen={false} />,
  },
  {
    id: 'SERVICES',
    nameLocale: 'APPS_SERVICES',
    icon: <ServicesIcon />,
    backgroundColor: SERVICES_APP_PRIMARY_COLOR,
    color: common.white,
    path: '/services',
    Route: () => <AppRoute id="SERVICES" path="/services" component={ServicesApp} emitOnOpen={false} />,
  },
  {
    id: 'VOICEMEMOS',
    nameLocale: 'APPS_VOICEMEMOS',
    icon: <VoiceMemosIcon />,
    backgroundColor: VOICE_MEMOS_APP_PRIMARY_COLOR,
    color: common.white,
    path: '/voicememos',
    Route: () => (
      <AppRoute id="VOICEMEMOS" path="/voicememos" component={VoiceMemosApp} emitOnOpen={false} />
    ),
  },
  {
    id: 'PAGES',
    nameLocale: 'APPS_PAGES',
    icon: <PagesIcon />,
    backgroundColor: PAGES_APP_PRIMARY_COLOR,
    color: common.white,
    path: '/pages',
    removable: true,
    storeDescription: 'Find local businesses and services',
    storeSizeKb: 84400,
    Route: () => <AppRoute id="PAGES" path="/pages" component={PagesApp} emitOnOpen={false} />,
  },
  {
    id: 'SNARF',
    nameLocale: 'APPS_SNARF',
    icon: <SnarfIcon />,
    backgroundColor: '#f97316',
    color: common.white,
    path: '/snarf',
    removable: true,
    storeDescription: 'Deliver food, get paid',
    storeSizeKb: 64200,
    Route: () => <AppRoute id="SNARF" path="/snarf" component={SnarfApp} emitOnOpen={false} />,
  },
  {
    id: 'RYDEME',
    nameLocale: 'APPS_RYDEME',
    icon: <RydemeIcon />,
    backgroundColor: '#14b8a6',
    color: common.white,
    path: '/rydeme',
    removable: true,
    storeDescription: 'Rides across Los Santos',
    storeSizeKb: 71800,
    Route: () => <AppRoute id="RYDEME" path="/rydeme" component={RydemeApp} emitOnOpen={false} />,
  },
  {
    id: 'CRYPTO',
    nameLocale: 'APPS_CRYPTO',
    icon: <CryptoIcon />,
    backgroundColor: '#e08a00',
    color: common.white,
    path: '/crypto',
    removable: true,
    storeDescription: 'Track and trade coins',
    storeSizeKb: 256700,
    Route: () => <AppRoute id="CRYPTO" path="/crypto" component={CryptoApp} emitOnOpen={false} />,
  },
  {
    id: 'INSTAPIC',
    nameLocale: 'APPS_INSTAPIC',
    icon: <InstaPicIcon />,
    backgroundColor: '#db2777',
    color: common.white,
    path: '/instapic',
    removable: true,
    storeDescription: 'Share photos',
    storeSizeKb: 223000,
    Route: () => <AppRoute id="INSTAPIC" path="/instapic" component={InstaPicApp} emitOnOpen={false} />,
  },
  {
    id: 'APPSTORE',
    nameLocale: 'APPS_APPSTORE',
    icon: <AppStoreIcon />,
    backgroundColor: APPSTORE_APP_PRIMARY_COLOR,
    color: common.white,
    path: '/appstore',
    Route: () => (
      <AppRoute id="APPSTORE" path="/appstore" component={AppStoreApp} emitOnOpen={false} />
    ),
  },
];

// Example app only in dev
if (import.meta.env.DEV) {
  APPS.push({
    id: 'EXAMPLE',
    nameLocale: 'APPS_EXAMPLE',
    icon: <ExampleIcon />,
    backgroundColor: blue[500],
    color: blue[50],
    path: '/example',
    Route: () => (
      <AppRoute id="EXAMPLE" path="/example" component={ExampleAppWrapper} emitOnOpen={false} />
    ),
  });
}
