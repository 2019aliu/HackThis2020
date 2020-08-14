import React, { useState } from "react";

import Card from "../components/Card/card";
import Tile from "../components/Tile/Tile";
import TopicSelector from "../components/TopicSelector/TopicSelector";
import GoogleLogo from "../assets/GoogleLogo.svg";
import WikipediaLogo from "../assets/Wikipedia_W.svg";

import styles from "../styles/CreateNew.module.scss";
import colors from "../styles/colors.scss";

// animation on scroll library
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
    duration: 1200,
})

export default function CreateNew(props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [summary, setSummary] = useState("");

    const topic = props.location.state.topic;
    // const topic = "pythagoras"; // test term
    const googleSearchTerm = topic.replace(' ', '+');
    const wikipediaSearchTerm = topic.replace(' ', '_');

    function handleSearchChange(result) {        
        console.log(result);
        setSearchTerm(result);
    }

    function handleSummaryChange(event) {
        setSummary(event.target.value);
    }

    return (
        <div className={styles.container}>
            <div className={styles.leftHalf} data-aos="fade-right" data-aos-duration="500">
                <Tile   backgroundColor={colors.mutedColor4}
                        width="100%"
                        height="150px"
                        borderRadius="20px"
                        boxShadow="-4px 4px 4px rgba(0,0,0,0.5)"
                        style={{marginBottom: "50px"}}>
                    <h1 style={{textAlign: "center", fontWeight: "bold"}}>{topic.toLocaleUpperCase()}</h1>
                </Tile>
                <Tile   backgroundColor="#ffffff"
                        width="100%"
                        height="500px"
                        borderRadius="20px"
                        boxShadow="-4px 4px 4px rgba(0,0,0,0.5)">
                    <h2 style={{textAlign: "center", fontWeight: "normal", fontSize: "28px"}}><br/>Summary</h2>
                    <textarea onChange={handleSummaryChange} style={{ flexGrow: "1", marginBottom: "20px", resize:"none"}} placeholder="Write your summary here"/>
                </Tile>
            </div>
            <div className={styles.rightHalf} data-aos="fade-left" data-aos-duration="500">
                <Tile   backgroundColor={colors.primaryColor1}
                        width="100%"
                        height="425px"
                        borderRadius="20px"
                        boxShadow="-4px 4px 4px rgba(0,0,0,0.5)">
                    <h2 style={{textAlign: "center", fontWeight: "normal", fontSize: "28px"}}>Select one Subject</h2>
                    <TopicSelector subjects={searchResults} setSubjects={setSearchResults} maxSubjects={1} style={{ height: "300px" }}/>
                </Tile>
                <Tile   backgroundColor={colors.primaryColor2}
                        width="100%"
                        height="150px"
                        borderRadius="20px"
                        boxShadow="-4px 4px 4px rgba(0,0,0,0.5)">
                    <h2 style={{textAlign: "center", fontWeight: "normal", fontSize: "28px"}}>Quick References</h2>
                    <div className={styles.logoContainer}>
                        <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/search?q=${googleSearchTerm}`}><img src={GoogleLogo} alt="Link to Google search"/></a>
                        <a target="_blank" rel="noopener noreferrer" href={`https://en.wikipedia.org/w/index.php?search=${wikipediaSearchTerm}`}><img src={WikipediaLogo} alt="Link to Wikipedia page"/></a>
                    </div>
                </Tile>
                <Card
                    add={false}
                    backgroundColor={colors.primaryColor3}
                    width="100%"
                    height="75px"
                    borderRadius="20px"
                    onClick={() => {
                        console.log(searchResults)
                        // first we make a topic
                        const requestOptions = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'SameSite':'None' },
                            credentials: 'include',
                            body: JSON.stringify({"topic":topic, "subject":searchResults[0]}),
                          };
                          fetch('/create_topic', requestOptions)

                        // then a room
                        const requestOptions2 = {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'SameSite':'None' },
                            credentials: 'include',
                            body: JSON.stringify({"topic":topic}),
                          };
                          fetch('/messages/join_room', requestOptions2).then(() => {
                              props.history.push("/chat")
                          })
                    }}>
                    <h1 style={{textAlign: "center", fontWeight: "normal", fontSize: "28px"}}>I'm Ready</h1>
                </Card>
            </div>
        </div>
    )
}