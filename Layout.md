# GOVZ Layout

This document defines the main GOVZ application layout, including the navigation bar and footer.

## Navigation Bar

The navigation bar appears at the top of every page and provides primary access to GOVZ services.

### Left Section

- Government-associated home/logo icon
- GOVZ text label

The logo should link to the home page.

### Center Navigation Menus

- Government Structure
- The Law
- Public Vote
- Opinion Polls
- Help Line

Each menu item should be clear, readable, and accessible from desktop and mobile layouts.

### Right Section

- Country selector icon
- Language selector icon
- Notification bell icon
- User profile icon

These icons should be grouped together and remain easy to access on all screen sizes.

## Footer

The footer appears at the bottom of every page and contains public contact and organization information.

### Phone Contacts

- Main office phone number
- Help line phone number
- Emergency or urgent support number, if available

### Social Platforms

- Facebook
- X / Twitter
- Instagram
- LinkedIn
- YouTube

### Address

- GOVZ office name
- Street address
- City / county
- Country
- Postal address, if available

## Layout Behavior

- The navigation bar should stay visually consistent across pages.
- The footer should use a simple multi-column layout on desktop.
- On mobile, footer sections should stack vertically.
- Icons should include accessible labels or screen-reader text.
- Navigation links should have visible hover and active states.

## Suggested Component Structure

```text
src/
  components/
    layout/
      app-header.tsx
      app-footer.tsx
      nav-link.tsx
```
