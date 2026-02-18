import "./PageLoader.css";

/**
 * Full-page loader shown while lazy-loaded route components are loading.
 * Includes a top progress bar + centered spinner overlay.
 */
export default function PageLoader() {
  return (
    <>
      {/* Top progress bar */}
      <div className="page-loader-bar">
        <div className="page-loader-bar__track" />
      </div>

      {/* Centered overlay */}
      <div className="page-loader-overlay">
        <div className="page-loader-spinner">
          <div className="page-loader-spinner__ring" />
          <span className="page-loader-spinner__icon">💊</span>
        </div>
        <span className="page-loader-text">Loading</span>
      </div>
    </>
  );
}
