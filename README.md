# Getting Started

- Pull down the `master` branch from this repo.
- Ask the developer of this repo for an `.env` file. Add this file in the root directory.
- Run `yarn` and `yarn dev`. This should spin up the app in http://localhost:3000.

## Running the project

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Prerequisites

Install `yarn` a package manager similar to `npm`.

```bash
npm install --global yarn
```

### Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the home page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Roboto, a custom Google Font.

# Learn More

Next.js has server _and_ client code. Files marked with `"use client";` at the top will always run on the browser. Features like `useState` only work in the browser because they require user input. Other files can be rendered in the server and allow for faster load times. Most importantly, we can run API endpoints in Next.js' server without having to run multiple projects at the same time. This simplifies our infrastructure and makes it easier to test changes locally.

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

# Ngrok

- For Windows, download the `ngrok.exe` file from https://ngrok.com/download and click to open that file. This should open up an ngrok window.
- In the ngrok window, run `ngrok config add-authtoken <token>` and `ngrok http --domain=chat.openjustice.ai 3000`. You may need to ask the developer for the token as well.
- The app should be running at https://chat.openjustice.ai ! (Might take a couple minutes to spin up the app)

# Developer Contributing Guidelines

- Make only small changes to each commits
- Create a new branch for every new request/ticket
- Use git rebase for cherry picking, avoid using git commit reset --hard if possible
