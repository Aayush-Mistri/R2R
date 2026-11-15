export default function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="error-text">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}
