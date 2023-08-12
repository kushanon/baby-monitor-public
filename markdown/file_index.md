## File Index

### Structure of main files
```
project-root/
├── server.js
└── public/
    ├── index.html
    ├── style.css
    └── js/
        ├── main.js
        ├── camera.js
        ├── audio.js
        ├── communication.js
        ├── poseDetection.js
        ├── features.js
        ├── visualization.js
        └── globalControl.js
```

### File Structure Description:

- **server.js**: Entry point for the Node.js server.
- **public/**: Directory containing client-side files.
  - **index.html**: Main HTML file.
  - **style.css**: Stylesheet for the HTML.
  - **js/**: JavaScript files for client-side logic.
    - **main.js**: Client-side entry point.
    - **camera.js**: Camera configuration and related functions.
    - **audio.js**: Audio analysis functions.
    - **communication.js**: Server communication management.
    - **poseDetection.js**: PoseNet loading and pose detection.
    - **features.js**: Functions to calculate features from poses.
    - **visualization.js**: Visualization of features.
    - **globalControl.js**: Global variable control.
