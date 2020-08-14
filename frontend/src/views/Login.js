import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { credentialValidation } from '../utils';
import styles from "../styles/Auth.module.scss";
import colors from "../styles/colors.scss";
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init({});

function Login(props) {
  const { register, handleSubmit } = useForm();
  const [credentialErrors, setCredentialErrors] = useState("");

  function onSubmit(data) {
    console.log(data);

    //   data validatidat
    const message = credentialValidation(data);
    if (message.length > 0) {
        setCredentialErrors(message);
        return;
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", SameSite: "Lax" },
      credentials: "include",
      body: JSON.stringify(data),
    };
    fetch("/login", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // all error messages will start with the word "invalid"
        if (data["response"] && data["response"][0] === "I") {
            let errorMessage = "";
            const rawErrorMessage = data["response"].toLowerCase();
            console.log(rawErrorMessage)
            
            if (rawErrorMessage.includes("username")) {
                errorMessage = "The username you entered doesn't seem to exist. Try it again?"
            } else if (rawErrorMessage.includes("password")) {
                errorMessage = "The password you entered doesn't quite match with what's registered. Try again?"
            } else {
                errorMessage = "The credentials don't seem to work, maybe try it again or try another set of credentials?"
            }
            setCredentialErrors(errorMessage);
        } else {
          props.history.push("/dashboard");
        }
      });
  }

  return (
    <div className={styles.container}>
      <div
        data-aos="fade-down"
        data-aos-duration="700"
        className={styles.infoBox}
      >
        <h1>Welcome Back!</h1>
        <p>Please login to your account to start using Epiphany.</p>
        <Link className={styles.switchAuth} to="/register">
          Don't have an account yet?
        </Link>
      </div>
      <div
        data-aos="fade-up"
        data-aos-duration="700"
        className={styles.formBox}
      >
        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          <label htmlFor="username">Username</label>
          <input
            className={styles.inputText}
            type="text"
            name="username"
            id="username"
            ref={register}
          />
          <label htmlFor="password">Password</label>
          <input
            className={styles.inputText}
            type="password"
            name="password"
            id="password"
            ref={register}
          />
          <p style={{color: colors.warningColor, height: "2vh"}}>{credentialErrors}</p>
          <button
            className={`${styles.loginButton} ${styles.button}`}
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
