import React from 'react';
import { Link } from "react-router-dom";

import Card from "../components/Card/card";
import Tile from "../components/Tile/Tile";
import GoogleLogo from "../assets/GoogleLogo.svg";
import WikipediaLogo from "../assets/Wikipedia_W.svg";

import styles from "../styles/CreateNew.module.scss";
import "../styles/info.scss";
import colors from "../styles/colors.scss"
// animation on scroll library
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
    duration: 1200,
})

export default function Info(props) {
    console.log(props.location.state.topic);
    const topic = props.location.state.topic;
    // const topic = "pythagoras"; // test term
    const googleSearchTerm = topic.replace(' ', '+');
    const wikipediaSearchTerm = topic.replace(' ', '_');

    // const summary = props.summary;
    const summary = "Here is an example summary of the topic";

    // const links = props.links;
    const links = ["https://plato.stanford.edu/entries/pythagoras/", "https://www.ancient.eu/Pythagoras/", "https://www.britannica.com/biography/Pythagoras"];

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
                    <h2 style={{textAlign: "center", fontWeight: "normal", fontSize: "28px", marginTop: "-20px"}}><br/>Summary</h2>
                    <p style={{height: "30vw", marginBottom: "20px"}}>{summary}</p>
                </Tile>
            </div>
            <div className={styles.rightHalf} data-aos="fade-left" data-aos-duration="500">
                <Tile   backgroundColor={colors.primaryColor2}
                        width="100%"
                        height="150px"
                        borderRadius="20px"
                        boxShadow="-4px 4px 4px rgba(0,0,0,0.5)">
                    <h2 style={{textAlign: "center", fontWeight: "normal", fontSize: "28px"}}>Quick References</h2>
                    <div className={styles.logoContainer}>
                        <a href={`https://www.google.com/search?q=${googleSearchTerm}`}><img src={GoogleLogo} alt="Link to Google search"/></a>
                        <a href={`https://en.wikipedia.org/w/index.php?search=${wikipediaSearchTerm}`}><img src={WikipediaLogo} alt="Link to Wikipedia page"/></a>
                    </div>
                </Tile>
                <div className="infoLinkContainer">
                    {links.map((link) => {
                        const urlBaseRegex = /^.+?[^/:](?=[?/]|$)/g;
                        const startOfBaseUrl = link.match(urlBaseRegex);

                        return <Card
                        add={false}
                        backgroundColor={colors.mutedColor2}
                        width="100%"
                        height="60px"
                        borderRadius="15px"
                        className="infoLink"
                        fontSize="1.2rem"
                        >
                            <a href={link}>{startOfBaseUrl}</a>
                        </Card>
                    })}
                </div>
                <Card
                    add={false}
                    backgroundColor={colors.primaryColor3}
                    width="100%"
                    height="75px"
                    borderRadius="20px">
                    <Link to="/chat" style={{textDecoration: "none", color: "black"}} data={{
                        isSummarizer: true,
                        summary: summary
                    }}>
                        I'm Ready
                    </Link>
                </Card>
            </div>
        </div>
    )
}