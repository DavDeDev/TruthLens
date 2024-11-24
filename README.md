# TruthLens - Hackathon Project Submission

**Slogan**: *Challenge Bias, Embrace Balance, Ignite Civic Insight*  

TruthLens is a web application that helps users assess the ideological bias of media content on the internet. With a simple "left" or "right" bias detector, TruthLens aims to provide users with the tools to explore alternative perspectives, break out of echo chambers, and engage in deeper civic dialogue.

### :tools: Built With:
- **Next.js**: A React framework for building optimized web applications with server-side rendering and static site generation.
- **Vercel**: For hosting and easy deployment.
- **Llama (AI)**: Natural language processing to analyze and determine the ideological leanings of media content.

## Features:
- **Bias Detection**:  
  Enter the URL of a media content, and TruthLens analyzes it to classify the content as either "left" or "right"-leaning.  

- **Explore Opposite Views**:  
  Due to its detection, users are encouraged to explore other viewpoints.

- **Intuitive User Interface**:  
  A clean and simple UI, designed to ensure a smooth user experience.

---

## :robot: How It Works:
1. **Media Bias Detection**:  
   When users input media content, TruthLens uses AI (Llama API) to process the content and classify it based on political ideology.
   
2. **Classification Results**:  
   The application returns a "left" or "right" label, depending on the detected bias of the media source. TruthLens analyzes the transcript for words and ideas presented in it.

3. **Alternate Viewpoints**:  
   Hence, TruthLens enables people to explore other viewpoints by educating themselves by bias, and echo chambers.

## Local development

This project was made with Next.js, Tailwind (shadcn), v0, and Claude (through Cursor's composer).

```sh
yarn
```

```sh
yarn dev
```

### Builds

```sh
yarn build
```

Then open [http://localhost:3000](http://localhost:3000)
