# Cookie Policy

**Effective Date**: January 1, 2026  
**Last Updated**: January 3, 2026

This Cookie Policy explains how BusTicket uses cookies and similar tracking technologies on our platform. By using our website, you consent to our use of cookies as described in this policy.

## What Are Cookies?

Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember information about your visit, making your next visit easier and the site more useful to you.

### Types of Tracking Technologies

In addition to cookies, we may use:

**Local Storage**: Browser storage that persists across sessions

- Seat selection session IDs
- User preferences
- Draft booking data

**Session Storage**: Temporary storage cleared when browser closes

- Form data
- Search filters
- Temporary states

**Web Beacons**: Small transparent images used in emails

- Email open tracking
- Link click tracking
- Delivery confirmation

**Socket Connections**: Real-time communication channels

- Seat availability updates
- Booking notifications
- Live chat (coming soon)

## How We Use Cookies

### 1. Essential Cookies (Always Active)

These cookies are necessary for our platform to function. They cannot be disabled as the website wouldn't work properly without them.

**Authentication & Security**:

- JWT access tokens (memory-only, 30-minute lifetime)
- JWT refresh tokens (httpOnly cookie, 30-day lifetime)
- Session identifiers
- CSRF protection tokens
- Account lockout tracking

**Technical Functionality**:

- Load balancing
- Server routing
- Security headers
- Error tracking
- Performance monitoring

**Booking Process**:

- Seat selection (localStorage: sessionId)
- Shopping cart state
- Payment process flow
- Form data persistence

**Examples**:

```
- accessToken (memory): User authentication
- refreshToken (httpOnly cookie): Token refresh mechanism
- sessionId (localStorage): Seat lock tracking
- connect.sid: Session management
```

### 2. Functional Cookies (Opt-Out Available)

These cookies enable enhanced functionality and personalization. The site will function without them, but some features may not work as intended.

**User Preferences**:

- Language selection
- Currency preference
- Notification settings
- Theme preferences
- Search history

**Enhanced Features**:

- Recently viewed trips
- Saved searches
- Favorite routes
- Booking history (quick access)
- Auto-fill passenger information

**Examples**:

```
- language: Selected interface language (en/vi)
- recentSearches: Last 5 search queries
- preferences: User settings object
```

### 3. Analytics Cookies (Opt-Out Available)

These cookies help us understand how visitors interact with our platform. All information is aggregated and anonymous.

**Usage Analytics**:

- Pages visited
- Time on site
- Click patterns
- Search behavior
- Booking funnel analysis

**Performance Monitoring**:

- Page load times
- Error rates
- API response times
- WebSocket connection stability

**User Journey**:

- Entry points
- Navigation paths
- Exit pages
- Conversion tracking
- Drop-off points

**Third-Party Analytics** (if used):

- Google Analytics
- Mixpanel
- Hotjar (heatmaps)

**Examples**:

```
- _ga: Google Analytics identifier
- _gid: Google Analytics session
- _utm_*: Campaign tracking parameters
```

### 4. Marketing Cookies (Opt-In Required)

These cookies are used to deliver relevant advertisements and measure campaign effectiveness. We only use marketing cookies with your explicit consent.

**Advertising**:

- Personalized ad delivery
- Ad frequency capping
- Campaign effectiveness
- Conversion attribution

**Retargeting**:

- Display ads for viewed trips
- Abandoned booking reminders
- Promotional offers
- Cross-platform tracking

**Social Media**:

- Facebook Pixel
- Twitter Pixel
- Instagram tracking

**Examples**:

```
- _fbp: Facebook Pixel
- _gcl_*: Google Ads conversion tracking
```

## Cookies We Use

### First-Party Cookies (Set by BusTicket)

| Cookie Name         | Type       | Duration   | Purpose                                         |
| ------------------- | ---------- | ---------- | ----------------------------------------------- |
| `refreshToken`      | Essential  | 30 days    | Authentication refresh token (httpOnly, secure) |
| `sessionId`         | Essential  | 10 minutes | Seat lock session identifier (localStorage)     |
| `language`          | Functional | 1 year     | User language preference                        |
| `preferences`       | Functional | 1 year     | User settings and preferences                   |
| `recentSearches`    | Functional | 30 days    | Recent search history                           |
| `analytics_session` | Analytics  | Session    | Anonymous usage tracking                        |
| `performance_id`    | Analytics  | 1 year     | Performance monitoring                          |

### Third-Party Cookies

| Provider         | Type      | Purpose               | Privacy Policy                                        |
| ---------------- | --------- | --------------------- | ----------------------------------------------------- |
| PayOS            | Essential | Payment processing    | [PayOS Privacy](#)                                    |
| Google Analytics | Analytics | Usage statistics      | [Google Privacy](https://policies.google.com/privacy) |
| Google OAuth     | Essential | Social login          | [Google Privacy](https://policies.google.com/privacy) |
| Facebook Pixel   | Marketing | Ad targeting (opt-in) | [Facebook Privacy](https://www.facebook.com/privacy)  |

## Cookie Lifespans

**Session Cookies**: Deleted when you close your browser

- Shopping cart state
- Search filters
- Form inputs

**Persistent Cookies**: Remain after browser closes

- `refreshToken`: 30 days
- `language`: 1 year
- `preferences`: 1 year
- `recentSearches`: 30 days

**Local Storage**: Persists until manually cleared

- `sessionId`: Expires after 10 minutes (managed by application)
- User preferences
- Draft bookings

## Managing Cookies

### Browser Settings

You can control cookies through your browser settings:

**Chrome**:

1. Settings → Privacy and security → Cookies and other site data
2. Choose: Allow all, Block third-party, Block all

**Firefox**:

1. Settings → Privacy & Security → Cookies and Site Data
2. Choose standard, strict, or custom protection

**Safari**:

1. Preferences → Privacy
2. Choose cookie blocking level

**Edge**:

1. Settings → Cookies and site permissions
2. Manage cookie settings

### Our Cookie Consent Manager

When you first visit BusTicket, you'll see our cookie consent banner:

**Options**:

- **Accept All**: Consent to all cookies
- **Reject Non-Essential**: Only essential cookies
- **Customize**: Choose specific cookie categories

You can change your preferences anytime by clicking "Cookie Settings" in the footer.

### Opt-Out Tools

**Marketing Cookies**:

- Use our cookie manager to disable
- Browser "Do Not Track" setting
- Industry opt-out tools:
  - [NAI Opt-Out](http://optout.networkadvertising.org/)
  - [DAA Opt-Out](http://optout.aboutads.info/)

**Analytics Cookies**:

- [Google Analytics Opt-Out](https://tools.google.com/dlpage/gaoptout)
- Browser privacy extensions
- Our cookie settings

## Impact of Blocking Cookies

### Essential Cookies Blocked

If you block essential cookies:

- ❌ Cannot log in or authenticate
- ❌ Booking process won't work
- ❌ Payment processing fails
- ❌ Seat selection doesn't persist
- ❌ Security features compromised

### Functional Cookies Blocked

If you block functional cookies:

- ⚠️ Language resets on each visit
- ⚠️ Search history not saved
- ⚠️ Preferences don't persist
- ⚠️ Auto-fill doesn't work
- ⚠️ Recent trips not shown

### Analytics Cookies Blocked

If you block analytics cookies:

- ✓ Platform still fully functional
- ℹ️ We can't improve based on your usage
- ℹ️ Personalization limited

### Marketing Cookies Blocked

If you block marketing cookies:

- ✓ Platform still fully functional
- ℹ️ Less relevant ads
- ℹ️ Promotional offers may not be personalized

## Special Cookie Implementations

### Seat Lock SessionId

**Purpose**: Track your seat reservations across the platform

**Storage**: localStorage (key: `sessionId`)

**Lifespan**: 10 minutes (automatically expired by backend)

**How it works**:

1. Generated when you select first seat
2. Stored in localStorage
3. Sent with booking request
4. Validated against backend seat locks
5. Prevents double-booking

**Privacy**: Session ID is random UUID, contains no personal data

### JWT Authentication Tokens

**Access Token**:

- **Storage**: Redux state (memory only, never persisted)
- **Lifespan**: 30 minutes
- **Purpose**: API authentication
- **Security**: Not stored in cookies or localStorage (XSS protection)

**Refresh Token**:

- **Storage**: httpOnly secure cookie
- **Lifespan**: 30 days
- **Purpose**: Obtain new access tokens
- **Security**: httpOnly (JavaScript can't access), Secure flag (HTTPS only)

### OAuth Tokens

When you sign in with Google:

- **Storage**: httpOnly cookies set by backend
- **Purpose**: Social authentication state
- **Security**: Secure, sameSite flags enabled
- **Privacy**: We only access public profile data

## Data Security

### Cookie Protection Measures

**httpOnly Flag**: Prevents JavaScript access (XSS protection)

```
Set-Cookie: refreshToken=xxx; httpOnly; secure; sameSite=strict
```

**Secure Flag**: Only transmitted over HTTPS

```
Set-Cookie: refreshToken=xxx; httpOnly; secure
```

**SameSite Attribute**: CSRF protection

```
sameSite=strict - Strictest protection
sameSite=lax - Balance security and usability
```

**Encryption**:

- All cookies transmitted over SSL/TLS
- Sensitive data encrypted before storage
- JWT tokens signed with secret key

## Third-Party Services

### Payment Processors

**PayOS**:

- Sets cookies for payment processing
- Secure transaction handling
- Fraud detection
- See [PayOS Privacy Policy](#)

**Credit Card Processors**:

- 3D Secure authentication cookies
- PCI DSS compliant
- Temporary session cookies only

### Analytics Providers

**Google Analytics** (if enabled):

- Collects anonymous usage data
- IP anonymization enabled
- Demographic data (aggregated)
- Opt-out available

### Social Media Integrations

**Google OAuth**:

- Authentication cookies
- Profile data access (with permission)
- See [Google Privacy Policy](https://policies.google.com/privacy)

**Social Sharing** (future):

- Share trip details
- Invite friends
- Track referrals

## Children's Privacy

Our platform is not intended for users under 18. We do not knowingly collect cookies or data from children. If you believe we have collected data from a child, contact us immediately.

## International Data Transfers

Cookies may result in data transfers to:

- Vietnam (our primary servers)
- Cloud providers (AWS, Google Cloud)
- Third-party services (analytics, payment processors)

We ensure adequate protection through:

- Standard contractual clauses
- Privacy Shield frameworks (where applicable)
- Service provider agreements

## Updates to Cookie Policy

We may update this Cookie Policy to:

- Reflect new cookie uses
- Comply with regulations
- Improve transparency
- Add new features

**How you'll know**:

- "Last Updated" date changes
- Notification on platform
- Email for significant changes
- Cookie banner reappears (if choices change)

## Your Rights

Under data protection laws, you have rights regarding cookies:

**Right to be Informed**: This policy explains our cookie use

**Right to Access**: View what cookies are active

**Right to Object**: Opt-out of non-essential cookies

**Right to Erasure**: Delete cookies anytime

**Right to Data Portability**: Export your preferences

**Right to Withdraw Consent**: Change cookie settings anytime

## Cookie Compliance

We comply with:

- Vietnam Personal Data Protection regulations
- GDPR (for EU visitors)
- ePrivacy Directive
- Industry best practices

**Our commitments**:

- ✅ Clear consent before non-essential cookies
- ✅ Easy opt-out mechanisms
- ✅ Transparent cookie information
- ✅ Respect "Do Not Track" signals (when possible)
- ✅ Regular policy reviews

## Contact Us

Questions about our cookie use?

**Data Protection Officer**  
Email: talenthive.website@gmail.com  
Phone: 0762685089  
Address: Ho Chi Minh City, Vietnam

**Response time**: Within 5 business days

### How to Contact Us

**Cookie-Specific Inquiries**:

- What cookies are on my device?
- How to delete specific cookies?
- Opt-out assistance
- Cookie consent issues

**Include in your message**:

- Browser and version
- Device type
- Screenshots (if applicable)
- Specific cookie names (if known)

---

**By using BusTicket, you acknowledge that you have read and understood this Cookie Policy.**

**Remember**: You control your cookies! Use our cookie manager or browser settings to customize your experience.

Last Updated: January 3, 2026
