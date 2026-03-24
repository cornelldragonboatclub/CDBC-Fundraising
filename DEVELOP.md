# Development Guide: Cornell Dragon Boat Fundraiser

This document outlines how to set up, run, and deploy the Chè Thái Fundraiser web application.

## Tech Stack
*   **Frontend:** HTML5, CSS3 (Tailwind CSS via CDN), Vanilla JavaScript
*   **Backend:** Vercel Serverless Functions (Node.js)
*   **Database:** MongoDB Atlas

## Prerequisites
Before you begin, ensure you have the following installed and set up:
1.  [Node.js](https://nodejs.org/) (v18 or higher recommended)
2.  A [MongoDB Atlas](https://cloud.mongodb.com/) account and a cluster.
3.  A [Vercel](https://vercel.com/) account.
4.  [Vercel CLI](https://vercel.com/docs/cli) installed globally:
    ```bash
    npm i -g vercel
    ```

## Local Development Setup

Because this project uses Vercel Serverless Functions (the `/api` folder), the easiest way to run it locally and test the backend is by using the Vercel CLI.

### 1. Clone the Repository
Clone your project to your local machine and navigate into the directory.

### 2. Install Dependencies
Install the required Node.js packages (specifically the `mongodb` driver for the backend):
```bash
npm install
```

### 3. Set Up Environment Variables
Create a file named `.env` in the root of your project. Add your MongoDB connection string to this file:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
```
*(Note: Never commit your `.env` file to GitHub. It should be added to your `.gitignore` file.)*

### 4. Run the Local Development Server
Use the Vercel CLI to start a local development environment. This will serve your `index.html` and simulate the serverless environment for your `/api/submit.js` function.
```bash
vercel dev
```
The CLI will prompt you to link the project to your Vercel account. Once linked, it will start a local server (usually at `http://localhost:3000`).

## Project Structure
*   `/index.html`: The main frontend file containing all HTML, Tailwind CSS styling, and JavaScript logic.
*   `/api/submit.js`: The Vercel Serverless Function that handles form submissions and connects to MongoDB.
*   `/package.json`: Manages project dependencies (e.g., `mongodb`).

## Deployment

This project is configured to be deployed on Vercel.

1.  **Push to GitHub:** Commit your changes and push them to your connected GitHub repository.
2.  **Automatic Deployment:** Vercel will automatically detect the push, build the project, and deploy the new version.
3.  **Environment Variables:** Ensure that your `MONGODB_URI` is set in your Vercel Project Settings -> Environment Variables.

## Troubleshooting
*   **Form Submit Fails Locally:** Ensure your `.env` file is correctly formatted and the MongoDB user has read/write access. Check the terminal running `vercel dev` for backend error logs.
*   **UI/Buttons Not Working:** Check the browser console (F12) for JavaScript errors. The frontend logic is entirely contained within the `<script>` tag at the bottom of `index.html`.
