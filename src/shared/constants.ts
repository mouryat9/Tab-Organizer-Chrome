import type { TemplateInfo } from './types'

export const GROUP_COLORS: chrome.tabGroups.ColorEnum[] = [
  'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange', 'grey',
]

export const STORAGE_KEYS = {
  SETTINGS: 'settings',
  COLOR_ASSIGNMENTS: 'colorAssignments',
  TAB_OPEN_TIMES: 'tabOpenTimes',
} as const

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'domain',
    label: 'By Domain',
    description: 'Group tabs by website (YouTube, GitHub, Google...)',
  },
  {
    id: 'session',
    label: 'By Session',
    description: 'Group tabs opened in the same browsing burst',
  },
  {
    id: 'category',
    label: 'By Category',
    description: 'Work, Entertainment, Social, Shopping, Research',
  },
  {
    id: 'recency',
    label: 'By Recency',
    description: 'Today, Yesterday, This Week, Older',
  },
  {
    id: 'activity',
    label: 'By Activity',
    description: 'Active, Stale, or Forgotten tabs',
  },
]

export const CATEGORY_RULES: Record<string, string> = {
  // Work
  github: 'Work', gitlab: 'Work', bitbucket: 'Work', jira: 'Work',
  confluence: 'Work', notion: 'Work', slack: 'Work', teams: 'Work',
  linear: 'Work', figma: 'Work', vercel: 'Work', netlify: 'Work',
  localhost: 'Work', asana: 'Work', trello: 'Work', zoom: 'Work',
  meet: 'Work', canva: 'Work', miro: 'Work',

  // Entertainment
  youtube: 'Entertainment', netflix: 'Entertainment', twitch: 'Entertainment',
  spotify: 'Entertainment', hulu: 'Entertainment', disneyplus: 'Entertainment',
  primevideo: 'Entertainment', vimeo: 'Entertainment', crunchyroll: 'Entertainment',
  hotstar: 'Entertainment', soundcloud: 'Entertainment',

  // Social
  twitter: 'Social', x: 'Social', facebook: 'Social', instagram: 'Social',
  reddit: 'Social', linkedin: 'Social', discord: 'Social', telegram: 'Social',
  whatsapp: 'Social', tiktok: 'Social', snapchat: 'Social', pinterest: 'Social',
  threads: 'Social', mastodon: 'Social',

  // Shopping
  amazon: 'Shopping', ebay: 'Shopping', walmart: 'Shopping', etsy: 'Shopping',
  aliexpress: 'Shopping', target: 'Shopping', bestbuy: 'Shopping',
  flipkart: 'Shopping', shopify: 'Shopping', wish: 'Shopping',

  // Research
  google: 'Research', stackoverflow: 'Research', wikipedia: 'Research',
  medium: 'Research', dev: 'Research', arxiv: 'Research', scholar: 'Research',
  mdn: 'Research', w3schools: 'Research', geeksforgeeks: 'Research',
  chatgpt: 'Research', claude: 'Research', bing: 'Research',
}

export const CATEGORY_COLORS: Record<string, chrome.tabGroups.ColorEnum> = {
  Work: 'blue',
  Entertainment: 'red',
  Social: 'pink',
  Shopping: 'yellow',
  Research: 'green',
  Other: 'grey',
}
