/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from 'react';
import { Row, Col } from 'reactstrap';
import landImg from '../assets/images/land-img.png';

function Home() {
  return (
    <div className="main-board">
      <div className="relative">
        <img className="home-img" src={landImg} />
        <div className="my-auto land-1">
          <div className="rounded p-4 pt-0">
            <div className="">
              <p className="">Because afternoon snacks can't be made from the office</p>
            </div>
            <div className="">
              <a className="btn btn-primary mx-1" href="/client-register">
                FIND SITTER
              </a>
              <a className="btn btn-warning mx-1" href="/service-provider-register">
                I'M A SITTER
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
