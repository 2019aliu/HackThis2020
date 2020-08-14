import React from "react";

import Tile from "../components/Tile/Tile";

import styles from "../styles/Faq.module.scss";
import colors from "../styles/colors.scss"
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
    duration: 1200,
})

class Question {
    constructor(question, answer, fadeDir, color) {
        this.question = question;
        this.answer = answer;
        this.fadeDir = fadeDir;
        this.color = color;
    }
}

class Faq extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      cardCount: 0,
    };
  }

  render() {
    const cardWidth = "90vw"

    const questions = [new Question("What is Epiphany?",
                                    "Epiphany is a platform that utilizes Feynman's technique, connecting people across the world to teach, learn, and grow.", "fade-right", colors.mutedColor1),
                        new Question("What is Feynman's Technique?",
                                    "Coined by the famous Physicist Richard Feynman, Feynman's technique is all about learning through teaching. \
                                    The heuristic involves first learning the content, then explaining it to someone as if they were 5 years old. \
                                    This helps identify gaps in your knowledge and reinforce your understanding.", "fade-left", colors.mutedColor2),
                        new Question("Why use Epiphany?", 
                                    "Khan Academy. Quizlet. Coursera. Other platforms help you learn; Epiphany helps you understand. Utilizing the technique above, Epiphany can help you augment your knowledge in all topics you're interested in, both as the learning and teaching party. \
                                    By being able to explain the concept thoroughly with our interactive platform, we can help each other internalize the subject you've learned. \
                                    You can be matched with anyone, whether it is a professional/educator looking to help out or a beginner looking to understand. \
                                    On this website, you can even look at other people's explanations to reach deeper insights.", "fade-right", colors.mutedColor3),
                        new Question("What topics can I learn on Epiphany?", 
                                    "Virtually anything you want to learn about! While Epiphany is targeted towards more academic subjects and topics, \
                                    you can create your own topics in areas you are passionate about, later to be approved. After once your conversation about the topic is over, we can\
                                    email the transcript of the conversation to you to keep for future references. We also have a reflection page for your feedback and to track our progress together!", "fade-left", colors.mutedColor1),
                        new Question("Sounds great! How do I start?", 
                                    "First, you need to register/login, then select the subjects you're interested in.\
                                    Thank you and enjoy your experience!", "fade-right", colors.mutedColor4)
                      ]
    const output = questions.map((questions) => 
        <div data-aos={questions.fadeDir} data-aos-duration='500' data-aos-delay='600' className={styles.cardContainer}>
            <Tile 
                backgroundColor={questions.color} 
                width={cardWidth} 
                height='auto'
                borderRadius='30px'
                justifyContent='flex-start'>
            <h1 className={styles.question}><b><i>{questions.question}</i></b></h1>
            <p className={styles.answer}>{questions.answer}</p>
        </Tile></div>
    );

    return (
      <div className={styles.container}>
        <div className={styles.title}>
          <div data-aos="fade-down" data-aos-duration="500" className={styles.user}>
            <h1>Frequently Asked Questions</h1>
          </div>
        </div>
        <div>{output}</div>
      </div>
    );
  }
}

export default Faq;