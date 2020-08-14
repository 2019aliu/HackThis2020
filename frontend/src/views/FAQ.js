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

    const questions = [new Question("What is the Feynman Technique?",
                                    "The Feynman Technique is a method used to effectively learning a concept.\n"+
                                    "It involves first learning the content, then explaining it to someone that is 5 years old,\n"+
                                    "then identifying gaps in your explanation; going back to relearn if necessary.", "fade-right", colors.mutedColor1),
                       new Question("Why should I use this technique?", 
                                    "It's a great method to effectively learn something.\n"+
                                    "By being able to explain it to a 5-year old, you know you have internalized the concept.\n"+
                                    "You are also able to talk to an expert live to identify gaps in your knowledge.\n"+
                                    "On this website, you can even look at other people's explanations to learn from them!", "fade-left", colors.mutedColor2)]
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