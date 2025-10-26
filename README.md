# Collaborative Whiteboard Application

Connect with multiple people on the same site and share a whiteboard for drawing or teaching purposes.

---

## Features (v1.0)

- Paintbrush  
- Eraser  
- Paint bucket  
- Color chooser  
- Adjustable brush size  
- 1000×700 canvas  
- Real-time connection to the same whiteboard  

## Features (v1.1)

- Classroom Support set up with custom rooms
- Each room has a custom generated code non-case sensitive
- host can kick/change permissions of other users
- users have 2 modes: viewer and painter
- nicknames introduced

---

## Prerequisites

Before getting started, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (and npm)  
- [ngrok](https://ngrok.com/)  

---

## Setup

Ensure that both `server.js` and `index.html` are located in your **home directory**.

> **Note:**  
> - Linux is currently supported for running the server.  
> - Windows users can still access the site via a browser, but running the server locally on Windows is not yet supported.

### 1. Start the Server

Open a terminal and run:

```bash
node server.js
```

### 2. Expose the Server Publicly via ngrok

In a separate terminal, run:

```bash
ngrok http 3000
```

This uses the ngrok cloud tunnel to make the server accessible externally.

> Make sure **port 3000** is open and accepting connections.

Once done, your collaborative whiteboard is ready to use.

---

## Update Log

**17:27 10/25/2025 – Version 1.0 released**

- Added paintbrush  
- Added eraser  
- Added paint bucket  
- Added paint color chooser  
- Added brush size adjustment  
- Added 1000×700 canvas  
- Added real-time connection to the same whiteboard  

**12:15 10/26/2025 – Version 2.0 released**

- **Room system**: Users can now create or join rooms using a 6-character code  
- **Nickname input**: Users can set a nickname (defaults to "Anon")  
- **Room-specific canvas history**: Each room maintains its own drawing history  
- **Multiple users**: Display a user list for each room  
- **Host assignment**: First user in a room becomes host  
- **User roles**: Host can assign “Painter” or “Viewer” permissions  
- **Kick functionality**: Host can remove users from the room  
- **Dynamic toolbar enable/disable**: Toolbar is disabled for viewers  
- **Improved flood fill**: Added optional emit for collaborative fill  
- **Touch support**: Canvas drawing works on mobile (touch events)  
- **Responsive UI**: Board, toolbar, and user list adapt to mobile and desktop layouts  
- **CSS separation**: Styles moved to `style.css` with improved layout and dropdown menus  
- **Improved canvas scaling**: Canvas scales correctly for mobile screens  
- **Server refactor**: Rooms are now objects with `users`, `history`, and `host`  
- **Socket events updated**:  
  - `joinRoom` (with nickname)  
  - `userList` with host and permissions  
  - `setPermission` and `kickUser` host-only actions  
  - `clear` resets room history  
  - `init` now initializes room-specific history  
- **UI enhancements**:  
  - Room code display  
  - Host dropdown menus for managing users  
  - Painter/viewer role badges next to usernames  
- **Bug fixes**:  
  - Prevent unauthorized users from drawing  
  - Automatically reassign host if original host disconnects  
  - Delete empty rooms automatically  


---

## How to Connect with Others

1. Share the **ngrok public URL** with collaborators.  
2. Everyone can draw and see updates in **real-time**.  

---

## Notes

- Currently, only **Linux** is fully supported for running the server.  
- Windows users can access the whiteboard via a browser but cannot run the server locally yet.
