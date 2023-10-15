"use client";
import { useState } from "react";
import styles from "./SQLEditor.module.css";
import { initialFormState, hashFetcher, parseFetcher, modifyFetcher, isJsonParseable, rebuildFetcher } from "./helpers";

export default function SQLEditor() {
  const [formState, setFormState] = useState(initialFormState);

  const handleFetch = (fetcher: (formState: typeof initialFormState) => Promise<{ query: string }>) => {
    return (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const form = event.currentTarget.form;
      if (!form || !form.checkValidity()) return;
      fetcher(formState)
        .then(data => {
          setFormState({ ...formState, sqlResult: data.query, error: "" });
        })
        .catch(error => {
          console.error(error);
          setFormState({ ...formState, error: error.message, sqlResult: "" });
        });
    };
  };

  const handleHash = handleFetch(() => hashFetcher({ ...formState, hash: true }));

  const handleUnhash = handleFetch(() => hashFetcher({ ...formState, hash: false }));

  const handleParse = () =>
    parseFetcher(formState.sql)
      .then(data => setFormState({ ...formState, sqlResult: JSON.stringify(data, null, 2), error: "" }))
      .catch(error => setFormState({ ...formState, error: error.message }));

  const handleModify = () =>
    modifyFetcher(formState.sql)
      .then(data => setFormState({ ...formState, sqlResult: JSON.stringify(data, null, 2), error: "" }))
      .catch(error => setFormState({ ...formState, error: error.message }));

  const handleRebuild = handleFetch(() => {
    if (typeof formState.sql === "string" && !isJsonParseable(formState.sql)) {
      throw new Error("Provide an AST object to rebuild.");
    }
    return rebuildFetcher(JSON.parse(formState.sql));
  });

  const handleCopy = () => navigator.clipboard.writeText(formState.sqlResult);

  return (
    <form className={styles.form} onSubmit={e => e.preventDefault()} role="form">
      <legend>SQL Editor</legend>
      <section className={styles.inputArea}>
        <textarea
          name="sql"
          required
          role="textbox"
          placeholder="Enter SQL here"
          value={formState.sql}
          onChange={event => setFormState({ ...formState, sql: event.target.value })}
        ></textarea>
        <div>
          <div>
            <button
              hidden={Boolean(!formState.sqlResult)}
              type="button"
              className={styles.copyButton}
              onClick={handleCopy}
            >
              copy
            </button>
          </div>
          <output>
            <code>{formState.sqlResult}</code>
          </output>
        </div>
      </section>
      <section className={styles.selectSection}>
        <label htmlFor="select">Select database:</label>
        <select
          id="select"
          name="select"
          role="combobox"
          value={formState.database}
          onChange={event => setFormState({ ...formState, database: event.target.value })}
        >
          <option value="BigQuery">BigQuery</option>
          <option value="DB2">DB2</option>
          <option value="Hive">Hive</option>
          <option value="MariaDB">MariaDB</option>
          <option value="MySQL">MySQL</option>
          <option value="PostgresQL">PostgresQL</option>
          <option value="Sqlite">Sqlite</option>
          <option value="TransactSQL">TransactSQL</option>
          <option value="FlinkSQL">FlinkSQL</option>
          <option value="Snowflake">Snowflake(alpha)</option>
        </select>
      </section>
      <section className={styles.errors}>
        <p>{formState.error}</p>
      </section>
      <section>
        <button role="button" type="submit" onClick={handleHash} title="Given an sql query, it hashes sql column names">
          Hash column names
        </button>
        <button
          role="button"
          type="submit"
          onClick={handleUnhash}
          title="Given an sql query, it unhashes hashed sql column names"
        >
          Unhash column names
        </button>
        <button
          role="button"
          type="submit"
          onClick={handleParse}
          title="Given an sql query, it parses the query and returns its AST representation"
        >
          Parse
        </button>
        <button
          role="button"
          type="submit"
          onClick={handleModify}
          title="Given an sql query, it returns a modified AST representation with hashed columns"
        >
          Modify
        </button>
        <button
          role="button"
          type="submit"
          onClick={handleRebuild}
          title="Given an AST object, it returns a rebuilt sql query"
        >
          Rebuild
        </button>
      </section>
    </form>
  );
}
