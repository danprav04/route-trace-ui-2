# RouteTrace Network Analysis Utility

<p align="center">
  <img src="https://img.shields.io/badge/react-19-blue.svg?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/redux-toolkit-purple.svg?logo=redux" alt="Redux Toolkit">
  <img src="https://img.shields.io/badge/mui-v7-blue.svg?logo=mui" alt="Material UI">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</p>

<p align="center">
  A modern, intuitive web application for visualizing and analyzing network paths. Perform combined L2/L3 traces, compare historical results, and gain deeper insights into your network's topology and behavior.
</p>

<p align="center">
  <img width="1918" height="943" alt="image" src="https://github.com/user-attachments/assets/020b7317-9a7d-42db-9e7f-4871ee372dbf" />
  <img width="1901" height="949" alt="image" src="https://github.com/user-attachments/assets/17c2b143-52a9-436a-bae7-bcf9f6fea2b7" />
  <img width="1133" height="940" alt="image" src="https://github.com/user-attachments/assets/958bc18b-62d3-4434-80eb-84f4aaecf3e5" />
</p>

## ✨ Key Features

*   **Three Powerful Trace Modes:**
    *   **Combined Trace:** Get a full end-to-end picture by combining Layer 3 IP hops with Layer 2 MAC address paths at both the source and destination.
    *   **Direct Route Trace:** Perform a targeted Layer 3 trace between two gateway IPs within a specific VRF context.
    *   **MAC Trace:** Isolate and visualize the Layer 2 path between an endpoint and its gateway.
*   **Interactive Visualizations:** Trace results are displayed as clear, interactive flow diagrams. Click on any hop to see detailed device information.
*   **Trace Comparison Engine:**
    *   Select any two or more historical traces to compare them side-by-side.
    *   **Common IP Highlighting:** Instantly identify shared devices across different traces with unique color-coding.
    *   Toggle a minimal "hops-only" view or a full detailed view.
    *   Visually reverse the direction of a trace for easier comparison.
*   **Rich History:**
    *   Automatically saves every trace you perform.
    *   Browse your personal history or view a complete history of all traces run by users (permission-based).
*   **Modern UI/UX:**
    *   Clean, responsive interface built with Material-UI.
    *   Light and Dark mode support.
    *   Secure login and authentication.
    *   Intelligent forms that automatically fetch gateway information.

## 🤝 Companion Backend

This frontend application is designed to work in tandem with our powerful backend API, which performs the actual network tracing and data management. For the full application to function, the backend service must be running and accessible.

*   **Backend Repository:** [https://github.com/danprav04/route-trace-api/](https://github.com/danprav04/route-trace-api/)

## 🚀 How It Works

The RouteTrace utility is a React-based single-page application (SPA) that communicates with a backend API to perform network traces.

1.  **Authentication:** The user logs in, and a JWT token is stored securely in a cookie for authenticating subsequent API requests.
2.  **Input:** The user selects a trace type and provides the necessary inputs (e.g., source/destination IPs). The application can automatically fetch the default gateway for an endpoint IP to simplify the process.
3.  **API Request:** The frontend sends the validated inputs to the backend API.
4.  **Backend Processing:** The backend receives the request, performs the actual network trace operations (using tools like `traceroute`, `arp`, etc.), and queries device information.
5.  **Data Persistence:** The backend saves the completed trace results, including all hop details and user information, to a database.
6.  **Response:** The backend returns the detailed trace results to the frontend.
7.  **Visualization:** The frontend parses the data and renders it as an interactive diagram. Each hop, whether it's an IP router or a MAC-layer switch, is displayed with its relevant details available in a pop-up.

<p align="center">
  <em>[GIF showcasing the trace comparison feature, highlighting common IPs]</em>
</p>

## 🛠️ Technology Stack

| Role             | Technology                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend**     | [React](https://reactjs.org/), [React Router](https://reactrouter.com/), [Redux Toolkit](https://redux-toolkit.js.org/), [Material-UI](https://mui.com/) |
| **API Client**   | [Axios](https://axios-http.com/)                                                                            |
| **Authentication** | [js-cookie](https://github.com/js-cookie/js-cookie) for token management                                    |
| **Styling**      | [Emotion](https://emotion.sh/) (via MUI)                                                                    |
| **Utilities**    | [date-fns](https://date-fns.org/) for date formatting, [uuid](https://github.com/uuidjs/uuid) for unique keys |

## 🔌 API Documentation

The frontend relies on a backend that exposes the following endpoints. The base URL for these endpoints should be configured in the `.env` file.

| Method | Endpoint                 | Description                                                                                             | Request Body/Params                                                                                                        |
| :----- | :----------------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/verify-device-auth`    | Authenticates a user and returns a token.                                                               | `{"username": "user", "password": "pw"}`                                                                                   |
| `GET`  | `/get-default-gateway`   | Fetches the default gateway for a given IP.                                                             | Query Params: `?ip={ip_address}`                                                                                           |
| `GET`  | `/get-mac-trace`         | Performs a Layer 2 trace between an endpoint and its gateway.                                           | Query Params: `?ip={endpoint_ip}&dg={gateway_ip}`                                                                          |
| `GET`  | `/get-route-trace`       | Performs a Layer 3 trace. Also used for the combined trace to save results.                             | Query Params: `?source_ip=...&destination_ip=...&source_dg=...&destination_dg=...&vrf=...` (DG/VRF are optional)            |
| `POST` | `/get-user-routes`       | Retrieves the trace history for the currently authenticated user.                                       | None (expects auth token)                                                                                                  |
| `POST` | `/get-all-routes`        | Retrieves the entire trace history for all users (admin/privileged access).                             | None (expects auth token)                                                                                                  |

## ⚙️ Getting Started

Follow these instructions to set up and run the project locally for development.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A running instance of the backend API service.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/route-trace-app.git
    cd route-trace-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Create a file named `.env.local` in the root of the project directory. This file is for local development variables and is ignored by Git.

4.  **Configure the API base URL:**
    Add the following line to your `.env.local` file, replacing the URL with the actual address of your backend API.
    ```
    REACT_APP_API_BASE_URL=http://localhost:8000
    ```

### Running the Application

Once the setup is complete, you can run the application in development mode:

```bash
npm start
```

This will start the development server and open the application in your default browser at [http://localhost:3000](http://localhost:3000). The page will automatically reload when you make changes to the source code.

## 📜 Available Scripts

*   `npm start`: Runs the app in development mode.
*   `npm test`: Launches the test runner in interactive watch mode.
*   `npm run build`: Builds the app for production to the `build` folder.
*   `npm run eject`: Ejects the app from Create React App's managed configuration. **Warning: This is a one-way operation.**

## 📂 Project Structure

The project follows a standard feature-based organization within the `src` folder.

```
route-trace-app/
├── public/              # Static assets and index.html
├── src/
│   ├── components/      # Reusable components (Auth, Common, Comparison, History, etc.)
│   ├── hooks/           # Custom React hooks (e.g., useAuth)
│   ├── pages/           # Top-level page components for each route
│   ├── services/        # API interaction layer (api.js, authService.js, routeService.js)
│   ├── store/           # Redux Toolkit state management (store.js, slices)
│   ├── utils/           # Helper functions (formatters, validators)
│   ├── App.js           # Main app component with routing logic
│   ├── index.js         # Application entry point
│   └── theme.js         # Material-UI theme configuration (light/dark modes)
└── package.json
```

---
