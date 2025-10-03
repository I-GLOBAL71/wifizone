# MikroTik Hotspot & Payment Management System

This project provides a complete solution for managing a paid Wi-Fi hotspot using a MikroTik router, with a Node.js backend, a Supabase database, and a React frontend. It handles user payments via Campay, automatically creates hotspot users, and provides admin and ambassador portals.

## Architecture

- **MikroTik Router**: Serves the Wi-Fi hotspot and exposes its API.
- **Backend (Node.js/Express)**: Manages payments, interacts with the MikroTik API to create users, and communicates with the database.
- **Database (Supabase)**: Stores data for users, tariffs, purchases, and ambassadors.
- **Frontend (React/Vite)**: Provides interfaces for users, ambassadors, and administrators.

---

## 1. MikroTik Router Setup

1.  **Connect to your MikroTik router** using WinBox or the web interface.
2.  Open a **New Terminal**.
3.  Copy the contents of the [`mikrotik_setup.rsc`](./mikrotik_setup.rsc:1) file.
4.  **Before pasting**, modify the placeholder values at the top of the script (e.g., `WAN_IF`, `SSID_24`, `WIFI_PASS`, `API_PASS`).
5.  Paste the modified script into the terminal and press Enter. This will configure the bridge, DHCP server, hotspot, and API user.
6.  **Security**: It is crucial to add a firewall rule to only allow your backend server's IP address to access the MikroTik API port (8728).
    ```rsc
    # In /ip firewall filter
    add chain=input protocol=tcp dst-port=8728 src-address=<YOUR_BACKEND_IP> action=accept
    add chain=input protocol=tcp dst-port=8728 action=drop
    ```

---

## 2. Supabase Database Setup

1.  Create a new project on [Supabase](https://supabase.com/).
2.  Navigate to the **SQL Editor**.
3.  Copy the contents of the [`supabase_schema.sql`](./supabase_schema.sql:1) file and run it to create the necessary tables (`users`, `tariffs`, `purchases`, `ambassadors`).
4.  Go to **Project Settings > API**. You will need the **Project URL** and the `service_role` **Secret Key** for the backend configuration.

---

## 3. Backend Setup & Deployment

1.  **Navigate to the `backend` directory**: `cd backend`
2.  **Create and configure the environment file**. In the `backend` directory, copy the `backend/.env.example` file to a new file named `.env`.
    
    **IMPORTANT**: The backend server will not start until you fill in these values.
    
    Fill in the values in the `.env` file with your actual credentials.

3.  **Navigate to the `frontend` directory**: `cd frontend`
4.  **Create and configure the environment file**. In the `frontend` directory, copy the `frontend/.env.example` file to a new file named `.env`.
    
    Fill in the values in the `.env` file with your actual credentials.
3.  **Install dependencies** in both the `backend` and `frontend` directories.
    ```bash
    npm install --prefix backend
    npm install --prefix frontend
    ```
4.  **Run the development servers**: From the **root** directory, run the following command:
    ```bash
    npm run dev
    ```
    This will start both the backend server (on port 3000) and the frontend server (on port 5173) concurrently. The CORS policy is configured to allow them to communicate.

5.  **Deployment**: For production, it is recommended to deploy the backend on a VPS or cloud service (like Heroku, Render, or AWS) and the frontend to a static hosting service.

---

## 4. Frontend Production Build

1.  **API URL**: The frontend code currently points to `http://localhost:3000` for API calls. Before building for production, update all `axios` calls in the `src/pages` files to point to your deployed backend's URL.
5.  **Build for production**: `npm run build`
6.  **Deployment**: The contents of the `dist` folder can be deployed to any static hosting service. The project is configured for easy deployment to [Firebase Hosting](https://firebase.google.com/docs/hosting).

---

## 5. Using the Application

-   **User App**: Access the root URL (`/`) to see the landing page. Navigate to `/packages` to purchase a data plan.
-   **Ambassador Portal**: Navigate to `/ambassador` to view the ambassador dashboard.
-   **Admin Panel**: Navigate to `/admin` to manage tariffs. You can add, view, and edit data plans that will be shown to users on the packages page.