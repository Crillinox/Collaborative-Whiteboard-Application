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

> More features will be implemented soon.

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

---

## How to Connect with Others

1. Share the **ngrok public URL** with collaborators.  
2. Everyone can draw and see updates in **real-time**.  

---

## Notes

- Currently, only **Linux** is fully supported for running the server.  
- Windows users can access the whiteboard via a browser but cannot run the server locally yet.
