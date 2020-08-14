import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Cookies from 'js-cookie';

import Card from "../components/Card/card";
import TopicSelector from "../components/TopicSelector/TopicSelector";

import styles from "../styles/Profile.module.scss";
import colors from "../styles/colors.scss";
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init({
  duration: 1200,
});

export default function Profile(props) {
  const [searchResults, setSearchResults] = useState([]);
  const history = useHistory();

  const username = Cookies.get("username");

  useEffect(() => {
    let interests = Cookies.get("interests").split("\\054").slice(0,-1);
    setSearchResults(interests);
    console.log(colors);
  }, [])

  function logOut() {
      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'SameSite':'Lax' },
        credentials: 'include',
      };

      fetch("/logout", requestOptions).then(res => res.json()).then(_ => history.push('/'))
  }

  return (
    <div>
      <h1
        data-aos="fade-down"
        data-aos-duration="600"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        {username}
      </h1>
      <div className={styles.profileContent}>
        <div
          data-aos="fade-right"
          data-aos-duration="800"
          data-aos-delay="600"
          className={styles.contentMain}
        >
          <h2 style={{ textAlign: "center", fontWeight: "400" }}>
            Change your subject preferences
          </h2>
          <TopicSelector
            subjects={searchResults}
            setSubjects={setSearchResults}
            maxSubjects={3}
            style={{
              backgroundColor: "#fafafa",
              width: "100%",
              height: "50vh"
            }}
          />
        </div>
        <div
          data-aos="fade-left"
          data-aos-duration="800"
          data-aos-delay="600"
          data-aos-offset="-500"
          className={styles.contentSide}
        >
          <Card
            add={false}
            backgroundColor="#27B68B"
            width="150px"
            height="60px"
            borderRadius="20px"
            fontSize="24px"
            onClick={() => props.history.push("/dashboard")}
          >
            <p>Save</p>
          </Card>
          <Card
            add={false}
            backgroundColor="#F25749"
            width="150px"
            height="60px"
            borderRadius="20px"
            fontSize="24px"
            onClick={() => props.history.goBack()}
          >
            <p>Cancel</p>
          </Card>
          <Card
            add={false}
            backgroundColor="#636D73"
            width="150px"
            height="60px"
            borderRadius="20px"
            fontSize="24px"
            onClick={logOut}
          >
            <p>Logout</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
