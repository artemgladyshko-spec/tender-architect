export default function DownloadPanel({
  apiBaseUrl,
  isAnalysisReady,
  isProposalReady,
}) {
  const handleProposalDownload = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/download-proposal`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Proposal download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "technical_proposal.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnalysisDownload = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/download-analysis`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Analysis download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "analysis_results.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Download Section</h2>
          <p>
            Download the analysis output after pipeline 1, then download the
            final proposal after pipeline 2 completes.
          </p>
        </div>
      </div>

      <div className="download-row">
        <button
          className="secondary-button"
          type="button"
          onClick={handleAnalysisDownload}
          disabled={!isAnalysisReady}
        >
          Download Analysis
        </button>

        <button
          className="primary-button"
          type="button"
          onClick={handleProposalDownload}
          disabled={!isProposalReady}
        >
          Download Proposal (DOCX)
        </button>
      </div>
    </section>
  );
}
