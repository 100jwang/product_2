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
- Firebase Authentication (Google & Email) integrated and functional.
- Firestore real-time chat persistence partially implemented.

## Current Plan (Firestore Persistence & Optimization)
1.  **Firestore Data Model:** Define a `messages` collection where each document contains `categoryId`, `userId`, `userName`, `userPhoto`, `text`, and `timestamp`.
2.  **Real-time Synchronization:** Use `onSnapshot` to listen for new messages in the active category and update the UI instantly.
3.  **Security Rules:** Define and provide the necessary Firestore Security Rules to allow authenticated users to read/write messages while protecting the data.
4.  **Indexing:** Ensure composite indexes are suggested for queries filtering by `categoryId` and ordering by `timestamp`.
5.  **Robust Error Handling:** Enhance the chat component to handle potential Firestore errors and provide feedback to the user.
