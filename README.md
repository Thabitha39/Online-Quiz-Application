# Quizify — Online Quiz Application

A responsive, front-end quiz project built with HTML, CSS and vanilla JavaScript. It runs directly in a browser and does not require MySQL, Flask, Node.js or any backend.

## Features
- Name entry and topic selection (HTML, CSS, JavaScript, Web basics, or all topics)
- Randomized question and option order
- 10-second countdown for each question
- Previous/next navigation and answer changes
- Automatic scoring and performance message
- Answer review with explanations
- Local leaderboard saved using browser Local Storage
- Responsive layout for desktop and mobile

## Folder structure
```text
Online_Quiz_Application_HTML_CSS_JS/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── app.js
    └── questions.js
```

## Run in VS Code
1. Download and extract the ZIP file.
2. Open VS Code.
3. Select **File → Open Folder** and choose `Online_Quiz_Application_HTML_CSS_JS`.
4. Open `index.html`.
5. Right-click inside the editor and choose **Open with Live Server** (if the Live Server extension is installed).
6. Alternatively, open the extracted folder in File Explorer and double-click `index.html`.

## Add your own questions
Open `js/questions.js` and add an object to `quizQuestions` using this structure:
```js
{
  category: "JavaScript",
  question: "What does DOM stand for?",
  options: [
    "Document Object Model",
    "Data Object Method",
    "Digital Ordinance Model",
    "Document Oriented Mode"
  ],
  answer: "Document Object Model",
  explanation: "The DOM represents a web page as a tree of objects."
}
```
The `category` should be `HTML`, `CSS`, `JavaScript`, or `General`. The answer must exactly match one of the option strings.

## Important notes
- Quiz scores are saved only in the current browser using Local Storage. They are not shared across devices or users.
- This is a front-end educational project. It has no admin panel, server-side authentication, or central database.
- To reset scores, use **Clear history** in the leaderboard.
