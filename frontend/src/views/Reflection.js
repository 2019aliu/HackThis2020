import React from "react";
import { Link, useHistory } from "react-router-dom"
import { api } from "../api"
import { useForm } from "react-hook-form"

// import Card from "../components/Card/card";

import styles from "../styles/Reflection.module.scss";
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
    duration: 1200,
})

function Reflection() {
  const history = useHistory();
  const { register, handleSubmit } = useForm();

  function onSubmit(data) {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'SameSite':'Lax' },
      credentials: 'include',
      body: JSON.stringify({
        topic: "asdf",
        body: data.content
      }),
    };

    fetch('/summary', requestOptions)
    console.log(data);
  }

    return (
      <div className={styles.container}>
        <div data-aos="fade-right" className={styles.summaryContainer}>
          <form id="summary">
            <textarea name="content" placeholder="How did it go? Reflect on your experience..." ref={register}></textarea>
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
              <button onClick={handleSubmit(onSubmit)}>Email me my reflection</button>
            </div>
            <div className={styles.topicButton}>
              <div className={styles.linkButton}>
                <Link to="/">I want to learn another topic</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default Reflection;
