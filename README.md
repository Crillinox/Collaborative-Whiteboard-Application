# Collaborative-Whiteboard-Application
Connect with multiple people on the same site and share a whiteboard for drawing or teaching purposes


**Prerequisites:**

Node.js and npm installed,
ngrok installed

**Setup:**

Ensure that both server.js and index.html are located in your home directory.
- Linux is currently supported for running the server.
- Windows users can still access the site via a browser, but running the server locally on Windows is not yet supported.

1. Open a terminal and start the server: node server.js

2. In a separate terminal, start ngrok to expose your server publicly: ngrok http 3000

This uses the ngrok cloud tunnel to make the server accessible externally.

Make sure port 3000 is open and accepting connections.

you now have a collaborative whiteboard application


more features will be implemented soon


**Update Log:**


17:27 10/25/2025: version 1.0 released
- added paintbrush
- added eraser
- added paint bucket
- added paint chooser
- added size of brush
- added 1000x700 canvas
- added realtime connection to same whiteboard
