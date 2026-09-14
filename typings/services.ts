export interface ServiceLocation {
  name: string;
  x: number;
  y: number;
}

export interface ServiceCompany {
  job: string;
  name: string;
  icon: string;
  location: ServiceLocation | null;
  open: boolean;
}

export interface ServiceEmployment {
  job: string;
  name: string;
  grade: string;
  isBoss: boolean;
  onDuty: boolean;
}

export interface ServiceCompaniesResp {
  companies: ServiceCompany[];
  employment?: ServiceEmployment | null;
}

export interface ServiceThreadSummary {
  id: number;
  company: string;
  title: string;
  icon: string | null;
  /** The viewer is answering as the company, not writing as a customer. */
  asCompany: boolean;
  lastMessage: string | null;
  updatedAt: number;
}

export interface ServiceMessage {
  id: number;
  channelId: number;
  senderName: string;
  fromCompany: boolean;
  mine?: boolean;
  message: string;
  x?: number | null;
  y?: number | null;
  createdAt: number;
}

export interface ServiceThread {
  id: number;
  company: string;
  title: string;
  asCompany: boolean;
  contactNumber?: string | null;
  messages: ServiceMessage[];
  error?: string;
}

export interface ServiceEmployee {
  citizenid: string;
  name: string;
  grade: number;
  online: boolean;
  onDuty: boolean;
  isSelf: boolean;
}

export interface ServiceGrade {
  level: number;
  name: string;
  isBoss: boolean;
}

export interface ServiceManagement {
  balance: number;
  grades: ServiceGrade[];
  employees: ServiceEmployee[];
  error?: string;
}

export interface ServiceActionResp {
  ok: boolean;
  error?: string;
  balance?: number;
  message?: ServiceMessage;
}

// Handled by lua/services/client.lua.
export enum ServicesEvents {
  GET_COMPANIES = 'npwd:services:getCompanies',
  GET_THREADS = 'npwd:services:getThreads',
  OPEN_THREAD = 'npwd:services:openThread',
  GET_THREAD = 'npwd:services:getThread',
  SEND_MESSAGE = 'npwd:services:sendMessage',
  SET_DUTY = 'npwd:services:setDuty',
  GET_MANAGEMENT = 'npwd:services:getManagement',
  MOVE_MONEY = 'npwd:services:moveMoney',
  FIRE = 'npwd:services:fire',
  SET_GRADE = 'npwd:services:setGrade',
  HIRE = 'npwd:services:hire',
  SET_WAYPOINT = 'npwd:services:setWaypoint',
  NEW_MESSAGE = 'npwd:services:newMessage',
}
