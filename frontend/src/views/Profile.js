import React, { useState } from "react";
import { Link } from "react-router-dom";

import Card from "../components/Card/card";
import TopicSelector from "../components/TopicSelector/TopicSelector";
import SearchBarAlt from "../components/SearchBarAlt/SearchBarAlt";

import styles from "../styles/Profile.module.scss";
import colors from "../styles/colors.scss";
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init({
  duration: 1200,
});

export default function Profile(props) {
  //   const username = props.username;
  const username = "potato";

  const [searchTerm, setSearchTerm] = useState("");
  // retrieve user prefs from database here
  //   const [searchResults, setSearchResults] = useState([props.subjectPrefs]);
  const [searchResults, setSearchResults] = useState(["Science", "Math", "CS"]);
  function handleSearchChange(result) {
    console.log(result);
    setSearchTerm(result);
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
          <div>
          <SearchBarAlt
            style={{ height: "50px", borderRadius: "10px" }}
            placeholderText="Search for subject"
            text={searchTerm}
            handleChange={handleSearchChange}
            onClick={() => {
              // retrieve search results
              const SEResults = [
                "something here",
                "something else here",
                "even more shit here",
                "something here",
                "something else here",
                "even more shit here",
                "something here",
                "something else here",
                "even more shit here",
              ];
              setSearchResults(SEResults);
            }}
          />
          </div>
          <TopicSelector
            results={searchResults}
            selectLimit={3}
            style={{
              backgroundColor: "#fafafa",
              width: "100%",
              border: "0.5px solid black",
            }}
          />
        </div>
        <div
          data-aos="fade-left"
          data-aos-duration="800"
          data-aos-delay="600"
          className={styles.contentSide}
        >
          <Card
            add={false}
            backgroundColor={colors.primaryColor3}
            width="100%"
            height="60px"
            borderRadius="20px"
            fontSize="24px"
          >
            <Link
              to="/dashboard"
              style={{ textDecoration: "none", color: "black" }}
              data={{
                username: username,
              }}
            >
              Save
            </Link>
          </Card>
          <Card
            add={false}
            backgroundColor={colors.warningColor}
            width="100%"
            height="60px"
            borderRadius="20px"
            fontSize="24px"
            onClick={() => props.history.goBack()}
          >
            Cancel
          </Card>
        </div>
      </div>
    </div>
  );
}
