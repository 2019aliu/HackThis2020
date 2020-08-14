import React from "react";

// import Card from "../components/Card/card";

import styles from "../styles/Reflection.module.scss";
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
    duration: 1200,
})

class Reflection extends React.Component {

  send_email() {
    console.log("HI")
    console.log("Text:" + this.state.text)
  }

  render() {
    return (
      <div className={styles.container}>
        <div data-aos="fade-right" className={styles.summaryContainer}>
          <form id="summary">
            <textarea name="text" placeholder="Write some thoughts here..."></textarea>
          </form>
        </div>
        <div data-aos="fade-left" className={styles.textContainer}>
          <div className={styles.title}>
            <h1>Reflect</h1>
          </div>
          <div className={styles.congratulatoryText}>
            <p>
                You just explained something! We hope you learned something as well!
            </p>
          </div>
          <div className={styles.awesome}>
            <p>
                Awesome!
            </p>
          </div>
          <div className={styles.nextSteps}>
            <p>
                We recommend reflecting on your explanation, such as taking note of what parts of the explanation were confusing or unclear.
            </p>
            <p>
                This helps you correct any mistakes and builds upon your knowledge.
            </p>
          </div>
          <div data-aos="fade-up" className={styles.buttonContainer}>
            <div className={styles.reflectionButton}>
              <button onclick={() => this.sendEmail}>Email me my reflection</button>
            </div>
            <div className={styles.topicButton}>
              <button>I want to learn another topic</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Reflection;
