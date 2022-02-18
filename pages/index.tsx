import type { NextPage } from "next";
import  Link  from "next/link";
// import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return <div className="page"><Link href="/chat"><a style={{color: '#0072b5'}}>Talk to Dream!</a></Link></div>;
};

export default Home;
