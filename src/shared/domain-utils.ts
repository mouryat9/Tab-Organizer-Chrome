const CC_SLDS = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'net.uk',
  'com.au', 'net.au', 'org.au', 'edu.au',
  'co.nz', 'net.nz', 'org.nz',
  'co.jp', 'or.jp', 'ne.jp',
  'co.in', 'net.in', 'org.in',
  'com.br', 'net.br', 'org.br',
  'co.za', 'org.za', 'net.za',
  'co.kr', 'or.kr',
  'com.sg', 'org.sg',
  'com.mx', 'org.mx',
  'co.il',
])

const INTERNAL_SCHEMES = ['chrome:', 'chrome-extension:', 'about:', 'edge:', 'brave:']

export function extractDomain(urlString: string): string | null {
  for (const scheme of INTERNAL_SCHEMES) {
    if (urlString.startsWith(scheme)) {
      return null
    }
  }

  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    return null
  }

  let hostname = url.hostname

  // Handle IP addresses
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith('[')) {
    return hostname
  }

  if (hostname === 'localhost') {
    return 'localhost'
  }

  // Remove www. prefix
  if (hostname.startsWith('www.')) {
    hostname = hostname.slice(4)
  }

  const parts = hostname.split('.')

  if (parts.length <= 2) {
    return parts[0]
  }

  // Check for country-code second-level domain
  const lastTwo = parts.slice(-2).join('.')
  if (CC_SLDS.has(lastTwo) && parts.length >= 3) {
    return parts[parts.length - 3]
  }

  // Standard: mail.google.com -> google
  return parts[parts.length - 2]
}

export function domainToGroupTitle(domain: string): string {
  if (!domain) return 'Other'

  // Well-known brand capitalizations
  const brands: Record<string, string> = {
    github: 'GitHub',
    youtube: 'YouTube',
    stackoverflow: 'StackOverflow',
    linkedin: 'LinkedIn',
    chatgpt: 'ChatGPT',
    gmail: 'Gmail',
    google: 'Google',
    reddit: 'Reddit',
    twitter: 'Twitter',
    facebook: 'Facebook',
    instagram: 'Instagram',
    whatsapp: 'WhatsApp',
    netflix: 'Netflix',
    spotify: 'Spotify',
    amazon: 'Amazon',
    wikipedia: 'Wikipedia',
  }

  const lower = domain.toLowerCase()
  if (brands[lower]) return brands[lower]

  return domain.charAt(0).toUpperCase() + domain.slice(1)
}
