import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { socket } from "../api";
import Cookies from 'js-cookie';
import Card from "../components/Card/card";
import styles from "../styles/Chat.module.scss";

import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
    duration: 1200,
})

const connectMsg = "Connected. Say hello!";
const disconnectMsg = "Disconnected";

function Chat(props) {
    const history = useHistory();

    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState(socket.connected ? connectMsg : disconnectMsg);
    const { handleSubmit, register, reset } = useForm();
    const bottomDiv = useRef(null);

    function getTime(epochTime) {
        if (!epochTime) return "";
        const d = new Date(epochTime * 1000);
        // i'm sorry
        return `${d.getHours() % 12 || 12}:${d
            .getMinutes()
            .toString()
            .padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
    }

    function onFinish() {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'SameSite':'None' },
            credentials: 'include',
          };
          fetch('/messages/leave_room', requestOptions).then(() => {
            history.push('/reflection')
          })
    }

    useEffect(() => {
        // joining and leaving the rooms on page load/unload

        socket.emit("join", {
            from_username: Cookies.get("username"),
            room: Cookies.get("room_id") || "temp"
        })

        return () => {
            socket.emit("leave", {
                from_username: Cookies.get("username"),
                room: Cookies.get("room_id") || "temp"
            })
        }

    },[])

    useEffect(() => {
        socket.on("connect", () => {
            setStatus(connectMsg);
            console.log("connected");
            // Change from_username later to the legit login username
        });
        socket.on("disconnect", () => {
            setStatus(disconnectMsg);
            console.log("disconnected");
        });
        socket.on("message", (data) => {
            console.log("got message");
            console.log(data);

            if (data.msg.length === 0) {
                return;
            }
            setMessages((m) =>
                m.concat({
                    username: data.from_username,
                    content: data.msg,
                    time: data.time_stamp,
                    highlight: false
                })
            );
            if(bottomDiv.current) bottomDiv.current.scrollIntoView({ behavior: "smooth" });
        });
    }, []);

    function onSubmit(data) {
        reset();
        console.log("sending message");
        console.log(data);
        socket.send({
            msg: data.content,
            from_username: Cookies.get("username") || "Feynman",
            room: Cookies.get("room_id") || "temp",
        });
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title} data-aos="fade-up" data-aos-once="true">{Cookies.get("topic")}</h1>
            <h3 className={styles.status} data-aos="fade-up" data-aos-delay="400" data-aos-once="true">{status}</h3>
            <div className={styles.windowContainer} data-aos="fade" data-aos-delay="800" data-aos-once="true">
                <div className={styles.messageWindow}> 
                    {messages.map((message, idx) => {
                        let showName = true;

                        if (
                            idx !== 0 &&
                            message.username === messages[idx - 1].username
                        ) {
                            showName = false;
                        }

                        return (
                            <div key={message.time} className={styles.message}>
                                {showName && (
                                    <p className={styles.username}>
                                        {message.username}

                                        <span className={styles.timeStamp}>
                                            {getTime(message.time)}
                                        </span>
                                    </p>
                                )}
                                <p
                                    className={`${styles.content} ${
                                        message.highlight
                                            ? styles.highlighted
                                            : ""
                                    }`}
                                    onClick={() => {
                                        const m = messages.slice();
                                        m[idx].highlight = !m[idx].highlight
                                        setMessages(m)
                                    }}
                                >
                                    {message.content}
                                </p>
                            </div>
                        );
                    })}
                    <div style={{ height: "20px" }} ref={bottomDiv}></div>
                </div>
                <div className={styles.buttonBox}>
                    <Card
                        height="100px"
                        width="200px"
                        fontSize="1.5rem"
                        borderRadius="20px"
                        add={false}
                        backgroundColor="#F25749"
                        onClick={onFinish}
                    >
                        I'm Finished
                    </Card>
                </div>
                <div className={styles.back}>
                    <Card
                        height="50px"
                        width="150px"
                        fontSize="1.5rem"
                        borderRadius="20px"
                        add={false}
                        backgroundColor="#EE774D"
                        onClick={() => {
                            history.goBack()
                        }}
                    >
                        Back
                    </Card>
                </div>
            </div>
            <form
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
                className={styles.chatBox}
                data-aos="fade-down"
                data-aos-once="true"
                data-aos-offset="-500"
            >
                <input
                    autoFocus={true}
                    type="text"
                    name="content"
                    placeholder="Enter your message..."
                    ref={register({
                        minLength: 1,
                        maxLength: 1000,
                    })}
                />
                <button className={styles.button} type="submit">
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chat;
