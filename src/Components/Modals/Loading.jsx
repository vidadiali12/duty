import React from "react";
import "./Loading.css";

const Loading = ({ loadingMessage }) => {
  return (
    <div className="global-loading-backdrop">
      <div className="global-loading-box">
        <div className="global-spinner"></div>
        {loadingMessage && <p>{loadingMessage}</p>}
      </div>
    </div>
  );
};

export default Loading;