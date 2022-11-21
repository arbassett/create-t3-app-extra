import { createRouteConfig, useMatch } from "@tanstack/react-router";
import styles from "./index.module.css";

const routeConfig = createRouteConfig().createRoute({
  path: "/",
  component: Home,
});

export default routeConfig;

function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Create <span className={styles.pinkSpan}>T3</span> Vite App
        </h1>
        <div className={styles.cardRow}>
          <a
            className={styles.card}
            href="https://create.t3.gg/en/usage/first-steps"
          >
            <h3 className={styles.cardTitle}>First Steps →</h3>
            <div className={styles.cardText}>
              Just the basics - Everything you need to know to set up your
              database and authentication.
            </div>
          </a>
          <a
            className={styles.card}
            href="https://create.t3.gg/en/introduction"
          >
            <h3 className={styles.cardTitle}>Documentation →</h3>
            <div className={styles.cardText}>
              Learn more about Create T3 App, the libraries it uses, and how to
              deploy it.
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
