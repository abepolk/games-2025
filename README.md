# React Tactics

## Background


This game is a cooperative effort between [Abe Polk](https://abepolk.com) and [Parker Porfilio](https://parkerporfilio.com). We aim to familiarize ourselves with React, as well as use AI in our workflows. We also are interested in game development. The game itself is a turn-based survival battle game.


## Tech Stack
- React
- Tailwind CSS
- Vite
- Vitest
- ESLint


## Game Design Features


Since the optimal strategy in many battle games with multiple enemies is to pick off one at a time, we added a dynamic to make this strategy the _less_ effective strategy. Specifically, we made it so that an enemy can take the weapon of a fallen enemy and build a spear. The spear is disproportionately powerful compared to starting weapons.


## Getting Started


### Prerequisites


- [Node.js](https://nodejs.org/) (latest LTS recommended)
- NPM


### Installation


1. Clone the repository:
   ```bash
   git clone https://github.com/abepolk/games-2025.git
   cd games-2025
   ```


2. Install dependencies:
   ```bash
   npm install
   ```


### Running the App


Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.


## Linting
```bash
npm run lint
```
Runs ESLint to check for code quality and style issues.


## Testing


The project includes unit tests for game logic and utility functions.
```bash
npm run test
```
Tests are located in:
- `src/gameLogic/gameLogic.test.js`
- `src/utils/utils.test.js`


## Copyright


All Rights Reserved.
