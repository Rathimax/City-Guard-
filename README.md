# 🛡️ CityGuard

**CityGuard** is a next-generation smart city management platform designed to bridge the gap between citizens and municipal authorities. It empowers communities to report, track, and prioritize urban infrastructure issues while providing city officials with a powerful, centralized command console for resource allocation.

## ✨ Key Features

### For Citizens
*   **Community Reporting:** Easily report local issues (e.g., potholes, broken streetlights) with photo evidence, geographic coordinates, and configurable urgency levels.
*   **Crowdsourced Prioritization:** A Reddit-style community voting system allows citizens to upvote pressing issues, directly influencing the city's maintenance queue.
*   **Real-Time Tracking:** Monitor the status of reported issues as they transition from "Pending" to "In Progress" and finally "Resolved."

### For Municipal Authorities (The Mayor's Console)
*   **Strategic Oversight:** A dedicated dashboard for city officials to view live reports and manage urban infrastructure.
*   **Council Assignments:** Assign issues to specific municipal departments (e.g., Public Works Dept, Sanitation Board, Water Authority).
*   **Direct Dispatch:** Issue specific "Mayor's Commands" for how problems should be resolved.
*   **Security Wall:** Resolved and archived cases are locked behind a professional security overlay to maintain data integrity, requiring a deliberate "Executive Override" to modify past records.

### Technical & UX Features
*   **Premium Glassmorphism UI:** A sleek, highly-polished interface that utilizes CSS blur effects and adaptive transparency.
*   **Light & Dark Modes:** Fluid transition between light and completely custom dark mode themes (incorporating deep slate tones).
*   **Dynamic Animations:** Powered by Framer Motion for smooth page transitions, responsive buttons, collapsible sections, and engaging success popups.

---

## 🛠️ Technology Stack

**Frontend Framework:**
*   [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
*   [Tailwind CSS (v4)](https://tailwindcss.com/) for rapid, modern styling.
*   [Framer Motion](https://www.framer.com/motion/) for advanced UI animations.
*   [Lucide React](https://lucide.dev/) for crisp, scalable iconography.

**Backend Services:**
*   [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   [MongoDB](https://www.mongodb.com/) (via Mongoose) for the primary database.
*   [Cloudinary](https://cloudinary.com/) (via Multer) for secure image hosting.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with an active MongoDB cluster and a Cloudinary account.

### 1. Installation

Clone the repository and install dependencies for both the frontend and the backend.

```bash
# Install frontend dependencies
npm install

# Navigate to the backend server and install dependencies
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory and provide the necessary credentials:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Running the Application

You need to run both the Vite frontend development server and the Node.js backend server simultaneously.

**Start the Frontend:**
Open a terminal in the root directory and run:
```bash
npm run dev
```

**Start the Backend:**
Open a separate terminal, navigate to the `server` directory, and run:
```bash
cd server
npm run dev
```

The application should now be running! The frontend runs on `http://localhost:XXXX` (or similar) and communicates with the backend API on port `XXXX`.

---

## 🏗️ Project Structure

*   **/src** - Contains all React frontend source files (Components, CSS, etc.)
    *   `IssueFeed.jsx`: The community board layout.
    *   `MayorConsole.jsx`: The administrative dashboard.
    *   `index.css`: Global styles and strict CSS variable theme definitions.
*   **/server** - Contains the Node.js backend.
    *   `server.js`: The Express entry point.
    *   Routes and Mongoose schemas for Issues.

---

*CityGuard - Built for smarter, safer, and cleaner cities.*
