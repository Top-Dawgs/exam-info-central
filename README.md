Full Setup Guide: Run the Project Locally (Frontend + Backend)
👥 Project Repo:
https://github.com/Top-Dawgs/exam-info-central

📁 Folder Structure:
java
Copy
Edit
exam-info-central/
├── frontend/          → React app (Vite + TypeScript + Tailwind)
└── resit-backend/     → Node.js + Express + MySQL backend

🧩 Step 1: Clone the Repository
Open VS Code

Open a new terminal: Terminal > New Terminal

Run:

bash
Copy
Edit


⚙️ Step 2: Install VS Code Extensions
Make sure these extensions are installed:

✅ ESLint

✅ Prettier

✅ Tailwind CSS IntelliSense

✅ JavaScript & TypeScript Nightly (optional)

✅ npm Intellisense

To install:

Go to the Extensions icon on the sidebar (Ctrl+Shift+X)

Search and install them

🛠️ Step 3: Set Up the Backend
1. Go into the backend folder:
bash
Copy
Edit
cd resit-backend
2. Install dependencies:
bash
Copy
Edit
npm install

3. Create .env file (if needed for your DB connection)

 4. Start the backend server:
npm run dev
http://localhost:3000

🌐 Step 4: Set Up the Frontend


1. Open a new terminal tab:
bash
Copy
Edit
cd ../frontend
2. Install frontend dependencies:
bash
Copy
Edit
npm install
3. Run the frontend:
bash
Copy
Edit
npm run dev
✅ Frontend runs at: http://localhost:5173 (or sometimes http://localhost:8080)

🔐 Step 5: Test Login and Role-Based Features
Go to http://localhost:5173

Register or login as:

student

instructor

faculty secretary

Try out:

Viewing grades

Uploading grades

Declaring for resit

Checking notifications

Viewing dashboards


💬 Final Notes
If MySQL is not installed, install XAMPP or MySQL Workbench

Make sure your MySQL service is running

Import or manually create the database schema from the backend


