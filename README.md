Prophet FE
----------

This is the frontend application for the Prophet project, built using **Next.js**. The app provides a modern and dynamic interface for submitting and managing claims with real-time updates and validation.

**Features**

\- Claim Submission: Users can submit claims with client-side validation and see immediate feedback.

\- Dynamic Updates: Claims are displayed in real-time with updated statuses.

\- Status Descriptions: Clear and user-friendly descriptions of claim statuses.

\- Modern Design: Powered by Once UI for a sleek and responsive interface.

\- Linguistic Checks: Integrated backend checks for advanced validation.

**Tech Stack**

\- React: Core framework for building the UI.

\- Next.js: Framework for server-side rendering and routing.

\- TypeScript: Ensures type safety and better developer experience.

\- Once UI: Component library for consistent design.

\- Spacy: Used in the backend for linguistic validation.

Project Structure
-----------------
.

├── LICENSE # License for the project

├── README.md # Project documentation

├── next-env.d.ts # TypeScript environment declaration

├── next.config.mjs # Next.js configuration

├── node\_modules/ # Installed dependencies

├── package.json # Project configuration and dependencies

├── package-lock.json # Dependency lock file

├── public/ # Static assets

│ ├── favicon.ico # Favicon for the app

│ └── images/ # Image assets

├── src/ # Source code for the app

│ ├── components/ # Reusable React components

│ ├── pages/ # Next.js pages and routes

│ ├── styles/ # CSS and SCSS files

│ ├── utils/ # Helper functions

│ └── hooks/ # Custom React hooks (if any)

└── .env.local # Environment variables (not tracked in Git)

Installation and Setup
----------------------

1. git clone https://github.com/ideolog/prophet-fe.git

2. cd prophet-fe

3. npm install

4. NEXT\_PUBLIC\_API\_URL=http://127.0.0.1:8000/api/

5. Replace the API\_URL with the appropriate backend endpoint.

6. npm run dev

7. Open your browser and navigate to http://localhost:3000.


Scripts
-------

Here are the available npm scripts:

*   npm run dev: Starts the development server.

*   npm run build: Builds the application for production.

*   npm start: Runs the production server locally.

*   npm run lint: Checks and fixes linting issues.


Dependencies
------------

The project’s dependencies are managed through package.json. Below are some key dependencies:

### **Core Dependencies**

*   react: ^18.3.1

*   next: ^14.2.4

*   typescript: ^5

*   once-ui: For component styling and layout.


### **Development Dependencies**

*   @types/react: Type definitions for React.

*   @types/node: Type definitions for Node.js.