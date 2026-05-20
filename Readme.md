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
    Client[React Frontend] -->|REST API Calls| Server[Node/Express Backend]
    Server -->|Read/Write User Data & History| Database[(MongoDB)]
    Server -->|Validate Credentials| Auth[Authentication Middleware]
    
    classDef frontend fill:#61DAFB,stroke:#333,stroke-width:2px,color:#000;
    classDef backend fill:#43853D,stroke:#333,stroke-width:2px,color:#fff;
    classDef db fill:#4EA94B,stroke:#333,stroke-width:2px,color:#fff;
    
    class Client frontend;
    class Server backend;
    class Database db;
