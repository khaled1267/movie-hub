prompt 1---

I am building a Movie Search application for my FlyRank internship assignment. I want to develop it step by step using you as my AI coding assistant.

First, initialize a new React application using Vite, React, and TypeScript.

Requirements:
- Use functional React components.
- Use TypeScript for the application.
- Use plain CSS for styling.
- Do not install any UI component library.
- Create a clean and simple project structure.
- Do not implement movie search, API integration, Firebase, authentication, or favorites yet.
- Do not add unnecessary dependencies.
- Explain the purpose of the important files you create.
- Run the available checks and fix any initialization errors.
- Do not modify unrelated files.
- Stop after completing this initial setup and wait for my review before implementing the next feature.
Important: This is a learning assignment. Explain your changes so I can understand the code and document how AI assisted me.



## Prompt 2: Create Header Component

Now implement the Header component for my Movie Search application.

Requirements:
- Create a reusable Header component.
- Show the application name "MovieHub".
- Add Home and Favorites navigation links.
- Add a search input field and a Search button.
- Use React functional components and TypeScript.
- Use plain CSS for styling.
- Make the header responsive for desktop and mobile screens.
- Keep the design clean, modern, and simple.
- Do not implement actual movie search or API integration yet.
- Do not implement Firebase or authentication.
- Do not modify unrelated files.
- Explain which files you created or modified.
- Run the production build and fix any errors.
- Stop after completing this feature and wait for my review.


## Prompt 3:Movie Search Functionality
Now implement the Movie Search functionality in my MovieHub application.

Requirements:

1. Use the OMDb API to search for movies.
2. Create a reusable API service file to handle movie search requests.
3. Use TypeScript interfaces for movie data and API responses.
4. Connect the search input and Search button in the Header to the movie search functionality.
5. When a user searches for a movie, display the matching movies on the Home page.
6. Create a reusable MovieCard component to display:
   - Movie poster
   - Movie title
   - Release year
   - Movie type
7. Handle loading, error, and empty search results states.
8. Validate the search input and prevent empty searches.
9. Keep components reusable and maintain a clean project structure.
10. Use plain CSS. Do not install any UI library.
11. Do not implement Firebase, authentication, or favorites yet.
12. Keep API credentials in environment variables. Never hardcode or expose API keys in source code.
13. Create a `.env.example` file showing the required environment variable names without real credentials.
14. Update `.gitignore` to exclude `.env` files containing secrets.
15. Explain all files created or modified.
16. Run the production build and fix any errors.

Important:
- Do not rewrite the entire application.
- Do not modify unrelated files.
- Explain how I can obtain and configure an OMDb API key.
- Stop after completing this feature and wait for my review.


## Prompt 4:Favorites Feature

Now implement the Favorites functionality in my MovieHub application.

Requirements:

1. Add a Favorite button to every MovieCard.
2. Allow users to add movies to their favorites.
3. Allow users to remove movies from favorites.
4. Create a separate Favorites page.
5. Display all favorite movies on the Favorites page.
6. Show an empty-state message when there are no favorite movies.
7. Persist favorites using localStorage so they remain after page refresh.
8. Use TypeScript and reusable React components.
9. Use plain CSS and maintain the existing design.
10. Keep Home and Favorites navigation working.
11. Prevent duplicate favorite movies using imdbID.
12. Do not implement Firebase or authentication yet.
13. Do not rewrite the entire application.
14. Explain all files created or modified.
15. Run the production build and fix any errors.
16. Stop after completing this feature and wait for my review.

Important: Explain how the Favorites state and localStorage synchronization work so I can understand the implementation.


## Prompt 5:

Improve the Home page of my existing MovieHub application.

Currently, movies only appear after the user searches. I want movies to appear automatically when the Home page loads.

Requirements:

1. Display 20 movies automatically when the Home page first loads.
2. Use the existing OMDb API service.
3. Fetch movies using multiple predefined search keywords such as Avengers, Batman, Spider-Man, Harry Potter, and Jurassic Park.
4. Combine the results from multiple searches.
5. Remove duplicate movies using imdbID.
6. Randomly shuffle the combined movie list.
7. Display up to 20 unique movies on the Home page.
8. Show a loading indicator while fetching movies.
9. Show a helpful error message if loading fails.
10. Keep the existing manual movie search functionality working.
11. When a user searches, show the search results instead of the default movies.
12. When the user clicks Home navigation, clear the previous search and load the default movies again.
13. Preserve the existing Favorites functionality.
14. Do not modify unrelated files.
15. Use TypeScript and plain CSS.
16. Run the production build and fix any errors.
17. Explain all files created or modified.

Important:
- Review the existing code before making changes.
- Do not rewrite the entire application.
- Stop after completing this feature and wait for my review.


## Prompt 6:Firebase
Implement Firebase Email and Password Authentication in my existing MovieHub application.

Requirements:

1. Integrate Firebase Authentication using the Firebase JavaScript SDK.
2. Create a Login page with email and password fields.
3. Create a Register page with name, email, password, and confirm password fields.
4. Implement email/password registration and login.
5. Implement logout functionality.
6. Add proper form validation and user-friendly error messages.
7. Create an AuthContext or AuthProvider to manage the authenticated user.
8. Show Login and Register links when the user is logged out.
9. Show the user's name and Logout button when logged in.
10. Keep the Home page publicly accessible.
11. Do not remove or break the existing Movie Search, automatic movie loading, or Favorites features.
12. Use environment variables for Firebase configuration.
13. Update .env.example with the required Firebase environment variable names.
14. Never hardcode Firebase credentials.
15. Use TypeScript and plain CSS.
16. Do not implement Firebase Realtime Database yet.
17. Explain all files created or modified.
18. Run the production build and fix any errors.
19. Stop after completing this feature and wait for my review.

Important:
- Review the existing project before making changes.
- Keep the implementation beginner-friendly.
- Explain how Firebase Authentication works.
- Do not rewrite unrelated files.




## Prompt 7: Firebase Realtime Database Integration

Integrate Firebase Realtime Database into my existing MovieHub application.

Requirements:

1. Use the existing Firebase configuration and initialization.
2. Save each authenticated user's favorite movies in Firebase Realtime Database.
3. Keep each user's favorites separate using their Firebase Authentication UID.
4. Load the logged-in user's favorites from Firebase.
5. Add and remove favorites in Firebase in real time.
6. When a user logs out, do not show their private favorites to another user.
7. When a user logs in on another device, load their saved favorites.
8. Preserve the existing Movie Search, Home page, Favorites page, and Authentication features.
9. Handle loading states and Firebase errors.
10. Use TypeScript and the existing CSS approach.
11. Do not expose credentials or hardcode secrets.
12. Configure secure Firebase Realtime Database rules so users can only read and write their own favorites.
13. Review the existing code before making changes. Avoid rewriting unrelated files.
14. Run the production build and fix any errors.
15. Explain which files you changed and how I can test the feature manually.

Stop after completing this task and wait for my next instruction.

## Prompt 8: Movie Details Page

Implement a Movie Details Page in my existing MovieHub application.

Requirements:

1. When a user clicks a MovieCard, navigate to a dedicated Movie Details page.
2. Use the existing OMDb API service to fetch full movie details using the movie's IMDb ID (i).
3. Display:
   - Movie Poster
   - Title
   - Release Year
   - IMDb Rating
   - Genre
   - Director
   - Actors
   - Runtime
   - Plot
   - Language
   - Country
4. Show a loading state while fetching details.
5. Show a friendly error message if details cannot be loaded.
6. Add an Add to Favorites / Remove from Favorites button.
7. Reuse the existing Firebase-based favorites functionality.
8. Add a Back button to return to the previous page.
9. Make the page responsive for mobile and desktop.
10. Follow the existing MovieHub design and CSS approach.
11. Do not break Movie Search, automatic movies, Authentication, or Favorites.
12. Use TypeScript and existing project patterns.
13. Avoid unnecessary dependencies and do not rewrite unrelated files.
14. Run npm run build and fix any errors.
15. Explain which files were changed and how to test the feature manually.

Review the existing project structure before implementation. Stop after completing this task and wait for my next instruction.

## Prompt 9: Professional Netflix-Inspired Dark UI

Redesign my existing MovieHub application with a professional, modern, Netflix-inspired dark movie streaming interface.

Important: Create an original MovieHub design. Do not copy Netflix branding, logo, or exact layout.

### Design Requirements

1. Use a cinematic dark theme with:
   - Deep black background
   - Dark charcoal sections
   - Red accent color
   - White primary text
   - Soft gray secondary text

2. Header:
   - Professional MovieHub logo/text
   - Home and Favorites navigation
   - Modern search bar
   - Login/Register or user profile/logout controls
   - Responsive mobile navigation

3. Home Page:
   - Attractive cinematic hero section
   - Featured movie information
   - Movie cards with poster, title, and release year
   - Smooth hover effects
   - Modern spacing and typography

4. Movie Cards:
   - Consistent poster sizes
   - Rounded corners
   - Subtle hover animations
   - Clear favorite buttons
   - Good visual hierarchy

5. Movie Details Page:
   - Large cinematic poster
   - Attractive movie information layout
   - IMDb rating highlighted
   - Clear Add/Remove Favorite button
   - Professional Back button

6. Favorites Page:
   - Consistent dark theme
   - Attractive empty state
   - Responsive movie grid

7. Authentication Pages:
   - Modern dark login and registration forms
   - Clear input fields and validation messages

8. Improve loading skeletons, error messages, and empty states.

9. Make the entire application responsive for desktop, tablet, and mobile.

10. Add accessible contrast, keyboard navigation, and visible focus states.

### Important Restrictions

- Use existing React, TypeScript, and plain CSS.
- Do not introduce a UI library.
- Do not break OMDb API integration.
- Do not break Firebase Authentication or Realtime Database Favorites.
- Do not change database rules or environment variables.
- Do not remove existing features.
- Reuse existing components where possible.
- Avoid unnecessary dependencies.
- Review the existing project before making changes.
- Run npm run build and fix all errors.

After implementation, explain the design changes and list the modified files. Stop and wait for my next instruction.