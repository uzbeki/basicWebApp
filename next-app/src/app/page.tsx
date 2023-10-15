import SQLEditor from "./components/SQLEditor";
import styles from './page.module.css'

export default function Home() {
  return <main className={styles.main}>
    <SQLEditor/>
  </main>
}
