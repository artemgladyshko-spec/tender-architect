export default function DownloadPanel({ isReady }) {
  const handleDownload = async () => {
    try {
      const response = await fetch("/download-proposal", {
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

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Download Section</h2>
          <p>
            {isReady
              ? "The generated proposal is ready to download."
              : "The DOCX proposal becomes available after the pipeline finishes."}
          </p>
        </div>
      </div>

      <div className="download-row">
        <button
          className="primary-button"
          type="button"
          onClick={handleDownload}
          disabled={!isReady}
        >
          Download Proposal (DOCX)
        </button>
      </div>
    </section>
  );
}
