import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Cookies from 'js-cookie';

import Card from "../components/Card/card";
import SearchBarAlt from "../components/SearchBarAlt/SearchBarAlt";

import styles from "../styles/Dashboard.module.scss";
import colors from "../styles/colors.scss";
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init({});

export default function Dashboard(props) {
    const username = Cookies.get("username");

    const history = useHistory();
    const [searchTerm, setSearchTerm] = useState("");
    const [cardColors, setCardColors] = useState([]);
    const [userPrefs, setUserPrefs] = useState([]);

    function handleSearchChange(result) {
        setSearchTerm(result);
    }

    useEffect(() => {
        const colorBankObj = colors;
        delete colorBankObj.basegrey;
        delete colorBankObj.warningColor;
        const colorBank = Object.values(colorBankObj);
        setCardColors(colorBank.sort(() => Math.random() - 0.5))
    }, [])

    useEffect(() => {
        console.log(searchTerm);
    }, [searchTerm])

    useEffect(() => {
        const interests = Cookies.get("interests")
        if(interests) setUserPrefs(interests.split("\\054").slice(0,-1))
    }, []);

    return (
        <div className={styles.dashboardContainer}>
            <h1 data-aos="fade-down" data-aos-duration="900" style={{ textAlign: "center", fontSize: "48px", marginTop: "50px"}}>Welcome, {username}</h1>
            <h2 data-aos="fade-down" data-aos-duration="900" data-aos-delay="700" style={{ textAlign: "center", fontSize: "28px", fontWeight: 400, marginBottom: "8vh", padding: "0 10vw"}}>What would you like to learn today?</h2>
            <div data-aos="fade-down" data-aos-duration="900" data-aos-delay="1500" className={styles.dashboardSearchContainer}>
                <SearchBarAlt
                    style={{ width: "60vw", height: "75px", borderRadius: "25px" }}
                    placeholderText="Search for topic or subject"
                    text={searchTerm}
                    handleChange={handleSearchChange}
                    onClick={() => {
                        console.log(`The search term passed was ${searchTerm}`);
                        history.push(`/search?q=${searchTerm.replace(' ', '+')}`);
                    }}
                />
            </div>
            <div data-aos="fade-up" data-aos-duration="900" data-aos-delay="1500">
                <h3 style={{ textAlign: "center", fontSize: "22px"}}>Your favorite subjects</h3>
                <div className={styles.cardContainer}>
                    {userPrefs.map((pref, index) => {
                        let fontSize;
                        if (pref.length < 10) {
                            fontSize = "36px"
                        } else {
                            fontSize = "24px";
                        }
                        return <Link style={{ textDecoration: "none", color: "black"}} key={index} className={styles.cardWrapper} to={`/search?q=${pref.replace(' ', '+')}`}><Card add={false}
                        width="100%"
                        height="150px"
                        borderRadius="30px"
                        fontSize={fontSize}
                        backgroundColor={cardColors[index % cardColors.length]}
                        >
                                <h3 style={{fontWeight: 400}}>{pref}</h3>
                        </Card></Link>
                    })}
                </div>
            </div>
        </div>
    )
}
