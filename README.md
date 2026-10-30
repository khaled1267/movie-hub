# 🎬 Movie App

A modern movie discovery application built with React, TypeScript, and Vite. Search for movies, explore movie details, and enjoy a clean, Netflix-inspired dark user interface.

## 🚀 Live Demo

[View Live Website](https://movie-be25j8muc-khaledkhan1267-5176s-projects.vercel.app/)

## ✨ Features

- 🔍 Search movies by title
- 🎥 Explore movie details
- 📝 View movie information from OMDb API
- 🌙 Modern dark-themed UI inspired by Netflix
- 📱 Responsive design
- ⚡ Fast performance with Vite
- 🔗 Serverless API integration with Vercel
- 🔒 Secure server-side API key handling

## 🛠️ Technologies Used

**Frontend:**
- React
- TypeScript
- Vite
- CSS

**Backend & API:**
- Node.js
- Vercel Serverless Functions
- OMDb API

**Tools:**
- Git & GitHub
- VS Code
- Vercel

## 📂 Project Structure

```text
movie-app/
├── api/
│   └── movies.js
├── lib/
│   └── movie-api-handler.js
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── server.mjs
├── vercel.json
├── vite.config.ts
├── package.json
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the Project

```bash
cd flyrank-movie-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
OMDB_API_KEY=your_omdb_api_key
```

Get your API key from [OMDb API](https://www.omdbapi.com/apikey.aspx).

Keep your API key private. Never commit your `.env` file to GitHub.

### 5. Run the Application

Start the backend development server:

```bash
node server.mjs
```

Start the frontend development server in another terminal:

```bash
npm run dev
```

Open the local URL provided by Vite.

## 🌐 Deployment

This application is deployed on Vercel.

The backend uses Vercel Serverless Functions.

To deploy:

1. Push your project to GitHub.
2. Import the repository into Vercel.
3. Add `OMDB_API_KEY` in Vercel Environment Variables.
4. Deploy the application.

## 🔑 API Reference

This project uses the [OMDb API](https://www.omdbapi.com/) to retrieve movie information.

**Movie Search:**
```text
/api/movies?title=Inception
```

**Movie Details:**
```text
/api/movies?imdbID=tt1375666
```

## 👨‍💻 Author

**Khaled Mahmud**

- GitHub: [@khaled1267](https://github.com/khaled1267)

## 📄 License

This project is created for educational and portfolio purposes. 

---

⭐ If you find this project interesting, feel free to explore the repository!
