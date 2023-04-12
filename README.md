# Getting Started

- Pull down the `master` branch from this repo.
- Ask the developer of this repo for an `.env` file. Add this file in the root directory.
- Run `npm install` and `npm start`. This should spin up the app in http://localhost:3000.
- For Windows, download the `ngrok.exe` file from https://ngrok.com/download and click to open that file. This should open up an ngrok window.
- In the ngrok window, run `ngrok config add-authtoken <token>` and `ngrok http --domain=chat.openjustice.ai 3000`. You may need to ask the developer for the token as well.
- The app should be running at https://chat.openjustice.ai ! (Might take a couple minutes to spin up the app)
