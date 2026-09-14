import dayjs from 'dayjs';
import {
  ServiceCompaniesResp,
  ServiceManagement,
  ServiceThread,
  ServiceThreadSummary,
} from '@typings/services';

const ERRORS: Record<string, string> = {
  not_boss: 'Only the boss can do that.',
  invalid_amount: 'Enter a valid amount.',
  no_money: "You don't have that much in the bank.",
  no_company_money: 'The company account is short.',
  not_found: 'Nobody with that server ID is in the city.',
  too_far: 'They need to be standing next to you.',
  invalid: 'Enter a valid server ID.',
  empty: 'Write a message first.',
  slow_down: 'Slow down a little.',
  no_access: "You can't open that conversation.",
};

export const serviceErrorText = (code?: string): string =>
  ERRORS[code ?? ''] ?? 'Something went wrong. Try again.';

export const formatServiceTime = (timestamp: number): string => {
  const time = dayjs(timestamp);
  return time.isSame(dayjs(), 'day') ? time.format('h:mm A') : time.format('MMM D');
};

// Browser-only stand-in data; fetchNui returns these only outside the game.
export const BrowserCompanies: ServiceCompaniesResp = {
  companies: [
    {
      job: 'police',
      name: 'Police',
      icon: 'https://cdn-icons-png.flaticon.com/512/7211/7211100.png',
      location: { name: 'Mission Row', x: 428.9, y: -984.5 },
      open: true,
    },
    {
      job: 'ambulance',
      name: 'Ambulance',
      icon: 'https://cdn-icons-png.flaticon.com/128/1032/1032989.png',
      location: { name: 'Pillbox', x: 304.2, y: -587.0 },
      open: true,
    },
    {
      job: 'mechanic',
      name: 'Mechanic',
      icon: 'https://cdn-icons-png.flaticon.com/128/10281/10281554.png',
      location: { name: 'LS Customs', x: -336.6, y: -134.3 },
      open: false,
    },
    {
      job: 'taxi',
      name: 'Taxi',
      icon: 'https://cdn-icons-png.flaticon.com/128/433/433449.png',
      location: { name: 'Taxi HQ', x: 984.2, y: -219.0 },
      open: false,
    },
  ],
  employment: { job: 'mechanic', name: 'Mechanic', grade: 'Owner', isBoss: true, onDuty: false },
};

export const BrowserThreads: ServiceThreadSummary[] = [
  {
    id: 1,
    company: 'police',
    title: 'Police',
    icon: 'https://cdn-icons-png.flaticon.com/512/7211/7211100.png',
    asCompany: false,
    lastMessage: 'An officer is on the way.',
    updatedAt: Date.now() - 300e3,
  },
  {
    id: 2,
    company: 'mechanic',
    title: 'Trevor Philips',
    icon: 'https://cdn-icons-png.flaticon.com/128/10281/10281554.png',
    asCompany: true,
    lastMessage: 'Shared a location',
    updatedAt: Date.now() - 3600e3,
  },
];

export const browserThread = (id: number): ServiceThread => ({
  id,
  company: 'police',
  title: 'Police',
  asCompany: false,
  messages: [
    {
      id: 1,
      channelId: id,
      senderName: 'Johnny Klebitz',
      fromCompany: false,
      mine: true,
      message: 'Someone just stole my bike outside the Lost clubhouse.',
      createdAt: Date.now() - 600e3,
    },
    {
      id: 2,
      channelId: id,
      senderName: 'Officer Tanisha',
      fromCompany: true,
      message: 'Share your location and stay where you are.',
      createdAt: Date.now() - 500e3,
    },
    {
      id: 3,
      channelId: id,
      senderName: 'Johnny Klebitz',
      fromCompany: false,
      mine: true,
      message: '',
      x: 980,
      y: -140,
      createdAt: Date.now() - 400e3,
    },
  ],
});

export const BrowserManagement: ServiceManagement = {
  balance: 18450,
  grades: [
    { level: 0, name: 'Recruit', isBoss: false },
    { level: 1, name: 'Mechanic', isBoss: false },
    { level: 2, name: 'Owner', isBoss: true },
  ],
  employees: [
    { citizenid: 'ABC123', name: 'Johnny Klebitz', grade: 2, online: true, onDuty: false, isSelf: true },
    { citizenid: 'DEF456', name: 'Terry Thorpe', grade: 1, online: true, onDuty: true, isSelf: false },
    { citizenid: 'GHI789', name: 'Clay Simons', grade: 0, online: false, onDuty: false, isSelf: false },
  ],
};
