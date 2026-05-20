<h1 align="center">🎬 ChalChitram</h1>

<p align="center">
  <strong>A modern, full-stack video streaming platform featuring secure authentication and personalized watch history.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

---

## 👁️ Visual Preview

<p align="center">
  <img src="demo-placeholder.gif" alt="ChalChitram Application Demo" width="80%">
</p>

## ✨ Key Features

* **Secure Authentication:** Robust user login and registration system protecting user data.
* **Personalized Watch History:** Dynamically tracks and stores user viewing habits.
* **RESTful API Architecture:** Clean, scalable backend endpoints for content delivery.
* **Responsive UI:** Optimized viewing experience across different devices and screen sizes.

## 🏗️ System Architecture

```mermaid
graph TD
    %% Frontend Subsystem
    subgraph Client [React Frontend Architecture]
        UI[React UI Components]
        Redux[Redux Store: Global State & Video Cache]
        Context[Context API: Auth State & Theme]
        
        UI <--> Redux
        UI <--> Context
    end

    %% Network Boundary
    Client -->|REST API + JWT Bearer Token| Router

    %% Backend Subsystem
    subgraph Server [Node/Express Backend]
        Router[Express API Router]
        
        %% Middlewares
        Auth[Auth Middleware: auth.js]
        JWT[JWT Service: Sign/Verify]
        Multer[Multer Middleware: Form-data/File Parser]
        
        Router --> Auth
        Auth <--> JWT
        Router --> Multer
    end

    %% External Storage & Database
    subgraph Data [Data & Media Storage]
        DB[(MongoDB)]
        Cloud[(Cloudinary)]
    end

    %% Backend to Data connections
    Multer -->|Stream Media Uploads| Cloud
    Cloud -.->|Return Secure Media URLs| Router
    Router -->|Read/Write User & Video Metadata| DB

    %% Styling
    classDef react fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000;
    classDef node fill:#43853D,stroke:#333,stroke-width:2px,color:#fff;
    classDef db fill:#4EA94B,stroke:#333,stroke-width:2px,color:#fff;
    classDef cloud fill:#F4B400,stroke:#333,stroke-width:2px,color:#000;
    classDef mid fill:#555,stroke:#333,stroke-width:2px,color:#fff;

    class UI,Redux,Context react;
    class Router node;
    class Auth,JWT,Multer mid;
    class DB db;
    class Cloud cloud;
