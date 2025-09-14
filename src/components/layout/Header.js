// src/components/layout/Header.js
import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>
        Sistema de Estacionamiento - Panel Admin
      </Link>
    </header>
  );
};

export default Header;
