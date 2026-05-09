# Project Blueprint: Sky-Blue Community Platform

## Overview
A sophisticated, real-time-inspired community platform for sharing information. Built with a "Baseline" approach using framework-less web technologies (HTML, CSS, JS) and Web Components. Integrated with Firebase for secure authentication and real-time data persistence.

## Features & Design
- **Authentication:** Firebase Auth supporting Google Login and Email/Password sign-in.
- **Persistent Real-time Chat:** Cloud Firestore for storing and syncing messages across all users in real-time.
- **Welcome Screen:** A sophisticated initial view that greets users and encourages them to explore categories.
- **Feedback Form:** A dedicated feedback submission system integrated with Formspree, accessible from the sidebar.
- **Category-based Navigation:** A sidebar allowing users to browse main categories and their sub-sections.
- **Sophisticated Aesthetic:**
    - **Palette:** White (`#ffffff`), Sky Blue (`oklch(75% 0.15 230)`), and soft grays.
    - **Shadows:** Deep, multi-layered shadows for a "lifted" card feel.
    - **Typography:** Bold hero headers and clean, legible body text.
    - **Interactivity:** Subtle transitions, hover glows, and responsive layout.

## Current State
- Core UI components and navigation implemented.
- Formspree feedback integration complete.
- **In Progress:** Integrating Firebase Authentication and Firestore persistence.

## Current Plan (Firebase Integration)
1.  **Firebase Setup:** Add SDKs and configuration placeholders.
2.  **Auth UI:** Create `<community-auth>` for login/signup.
3.  **Persistence:** Migrate `<community-chat>` to use Firestore for message storage.
4.  **User State:** Display user profile in messages and sidebar.
