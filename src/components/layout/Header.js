// src/components/layout/Header.js
import React from "react";
import { Link } from "react-router-dom";
import "../../styles/header.css";

const Header = () => {
  return (
    <header>
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>
        PlazaPark - Panel Admin
      </Link>
    </header>
  );
};

export default Header;
