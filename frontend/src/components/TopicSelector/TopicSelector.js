import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../api"

import styles from "./TopicSelector.module.scss";

function TopicSelector({ subjects, setSubjects, maxSubjects, style }) {
    const { register, watch } = useForm();
    const query = watch("search") || "";

    const [available, setAvailable] = useState([]);

    useEffect(() => {
        async function fetchSubjects() {
            try {
                const result = await api.get("/get_subjects")
                
                console.log(result.data);
                setAvailable(result.data.map(subj => subj.title).filter(subj => !subjects.includes(subj)))
            } catch (err) {
                console.log(err);
            }
        }
        fetchSubjects();
    }, [])

    useEffect(() => {
        const subjSet = new Set();

        console.log(subjects);
        console.log(available);

        setAvailable(available.filter(subj => !subjects.includes(subj)))
    }, [])

    function Available({ subject }) {
        return (
            <div
                onClick={() => {
                    if (subjects.length >= maxSubjects) return;

                    setAvailable(available.filter((subj) => subj !== subject));
                    if(!subjects.includes(subject)) setSubjects(subjects.concat(subject));
                }}
                className={subjects.length < maxSubjects ? styles.available : styles.unavailable}
            >
                {subject}
            </div>
        );
    }

    function Selected({ subject }) {
        return (
            <div
                onClick={() => {
                    setSubjects(subjects.filter((subj) => subj !== subject));
                    if(!available.includes(subject)) setAvailable(available.concat(subject));
                }}
                className={styles.selected}
            >
                {subject}
                <i className={`fa fa-times ${styles.closeButton}`}></i>
            </div>
        );
    }

    return (
        <div className={styles.topicSelectorContainer} style={style}>
            <input
                type="search"
                name="search"
                placeholder="Search"
                className={styles.searchBar}
                ref={register}
            />
            <div className={styles.resultContainer}>
                <div className={styles.results}>
                    {subjects.sort().map((subj) => (
                        <Selected key={subj} subject={subj} />
                    ))}
                    {available
                        .sort()
                        .filter((subj) =>
                            subj.toLowerCase().includes(query.toLowerCase())
                        )
                        .map((subj) => (
                            <Available key={subj} subject={subj} />
                        ))}
                </div>
            </div>
        </div>
    );
}

export default TopicSelector;
