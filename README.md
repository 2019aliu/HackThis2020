# The Feynman Technique

Created by: Alex Liu, Christopher Lo, Jinay Jain, Noelle Crawford, Joy Liu, Alex Zhang, Marcelo Morales

## Usage

1. Install [yarn](https://yarnpkg.com/)
2. Install [Python 3](https://www.python.org/downloads/)
3. Run `installApp.sh`

Start the backend server

## The Magic Behind Feynman: Feynman's Technique

The Feynman Learning Technique consists of the following:

1. Choose a concept you want to learn about
2. Pretend you are teaching it to someone that is 5 years old
3. Identify gaps in your explanation; go back and relearn if necessary

This website brings this technique to you in a sleek and modern service.

![Home Page](/Designs/homepage.png)

## User flow

1. Sign in/log in to save the subjects you're an expert at and the subjects you want to learn
![Sign-in Page](/Designs/subjectsPage.png)
2. Sources to learn the subject you want to learn - quick links to top 3 results of Google and Wikipedia

3. After learning, try to explain the topic to someone that is 5 years old
![Source and Summary Page](/Designs/summaryPage.png)
4. Chat with an expert in a 1-on-1 realtime chat, with email verification to prevent trolls and harrassment
![Chat Page](/Designs/chatpage.png)
5. For the person reading to the explanation, provides a summary using gensim, an NLP library

6. Reflect on what you learned and what you need to improve on
![Reflect Page](/Designs/reflectionPage.png)
