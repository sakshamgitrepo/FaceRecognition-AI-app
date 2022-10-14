import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Moment from "react-moment";
import { io } from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";
import { v4 as uuidv4 } from "uuid";

const ChatRoom = () => {
  const location = useLocation();

  const [data, setData] = useState({});
  const [msg, setMsg] = useState("");
  const [socket, setSocket] = useState();
  const [allMsges, setAllMsges] = useState([]);

  useEffect(() => {
    const socket = io("https://chatarena-server.herokuapp.com/");
    setSocket(socket);

    socket.on("connect", () => {
      console.log(socket.id);
      // alert('connected');
      socket.emit("joinRoom", location.state.room);

      const user = location.state.name;
      console.log(user);
      socket.emit("joinUser", user);

      socket.on("userJoined", ({ user, message }) => {
        alert(`${user}${message}`);
      });

      socket.on('leave',({ user, message} )=>{
        alert(`${user}${message}`);
      })
    });

    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, []);

  useEffect(() => {
    setData(location.state);
  }, [location]);

  useEffect(() => {
    if (socket) {
      socket.on("getLatestMessage", (newMsg) => {
        setAllMsges([...allMsges, newMsg]);
        setMsg("");
      });
    }
  }, [socket, allMsges]);

  const handleChange = (e) => {
    setMsg(e.target.value);
  };
  const handleEnter = (e) => (e.keyCode === 13 ? handleSubmit() : "");
  const handleSubmit = () => {
    if (msg) {
      const newMsg = { time: new Date(), msg, name: data.name };
      socket.emit("newMessage", { newMsg, room: data.room });
    }
  };

  return (
    <div className="py-4 m-3 shadow  text-dark border rounded container chatroom">
      <div className="text-center px-3 mb-3 text-capitalize">
        <h1 className="text-dark mb-2">{data?.room} Chat Room</h1>
        <h4 className="text-dark border-top pt-2">{data?.name}</h4>
      </div>
      <div
        className=" border rounded mb-4 chatfield"
        
      >
        <ScrollToBottom className="scrolltobottom">
          {allMsges.map((allmsg) => {
            return data.name === allmsg.name ? (
              <div
                className="row justify-content-end pl-5 m-2 mb-3 "
                style={{ position: "relative" }}
                key={uuidv4()}
              >
                <div className="d-flex flex-column align-items-end m-2 shadow p-2 bg-info  w-auto msgBoxright">
                  <div>
                    <strong className="m-1">{allmsg.name}</strong>
                    <small className="text-muted m-1 smalltagright">
                      <Moment fromNow>{allmsg.time}</Moment>
                    </small>
                  </div>
                  <h4 className="m-1">{allmsg.msg}</h4>
                </div>
              </div>
            ) : (
              <div
                className="row justify-content-start m-2 mb-3"
                style={{ position: "relative" }}
                key={uuidv4()}
              >
                <div className="d-flex flex-column m-2 p-2  shadow bg-white w-auto msgBoxleft">
                  <div>
                    <strong className="m-1">{allmsg.name}</strong>
                    <small className="text-muted m-1 smalltagleft">
                      <Moment fromNow>{allmsg.time}</Moment>
                    </small>
                  </div>
                  <h4 className="m-1">{allmsg.msg}</h4>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="form-group d-flex">
        <input
          type="text"
          className="form-control chatinput "
          name="message"
          placeholder="Type your message"
          onChange={handleChange}
          value={msg}
          onKeyDown={handleEnter}
        />
        <button
          type="button"
          className="btn btn-dark mx-2"
          onClick={handleSubmit}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="20"
            fill="currentColor"
            className="bi bi-send"
            viewBox="0 0 16 16"
          >
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
