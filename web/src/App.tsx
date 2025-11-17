import { useMemo, useState } from "react";
import axios from "axios";
import Section from "./components/Section";
import FileDropzone from "./components/FileDropzone";

type EvidenceItem = {
  category: string;
  screenshotSource: string;
  attachmentType?: string;
  images: File[];
};

export default function App() {
  const [appName, setAppName] = useState("CPLAT");
  const [appArea, setAppArea] = useState("COMMONS PLATFORM");
  const [centerId, setCenterId] = useState("C-306701");

  const [excelFile, setExcelFile] = useState<File | null>(null);

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([
    {
      category: "BoKS Entitlements (AIMS)",
      screenshotSource: "",
      attachmentType: "",
      images: []
    }
  ]);

  const requiredMissing = useMemo(() => {
    const missingExcel = !excelFile;
    const itemMissing = evidenceItems.some(
      (i) => !i.category || !i.screenshotSource || i.images.length === 0
    );
    return missingExcel || itemMissing;
  }, [excelFile, evidenceItems]);

  async function handleDownloadTemplate() {
    try {
      const res = await axios.get("/api/template", {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "evidence_template.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to download template.");
    }
  }

  async function uploadExcelIfNeeded() {
    if (!excelFile) return;
    const form = new FormData();
    form.append("excel", excelFile);
    await axios.post("/api/upload-excel", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }

  async function uploadImagesIfNeeded() {
    const form = new FormData();
    evidenceItems.forEach((item, idx) => {
      item.images.forEach((img, j) => {
        form.append("images", img, `evidence_${idx}_${j}_${img.name}`);
      });
    });
    await axios.post("/api/upload-images", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }

  async function handleSubmit() {
    if (requiredMissing) return;
    try {
      await uploadExcelIfNeeded();
      await uploadImagesIfNeeded();
      const payload = {
        application: { name: appName, area: appArea, centerId },
        evidence: evidenceItems.map((e) => ({
          category: e.category,
          screenshotSource: e.screenshotSource,
          attachmentType: e.attachmentType,
          imagesCount: e.images.length
        }))
      };
      await axios.post("/api/submit", payload);
      alert("Evidence submitted successfully.");
      window.location.reload();
    } catch (e) {
      alert("Submission failed.");
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">FARGO</div>
        <div className="title">My Compliance Center</div>
      </header>

      <main className="container">
        <Section title="Application Details">
          <div className="grid">
            <div className="field">
              <label>Application Name</label>
              <select value={appName} onChange={(e) => setAppName(e.target.value)}>
                <option value="CPLAT">CPLAT</option>
                <option value="APP1">APP1</option>
                <option value="APP2">APP2</option>
              </select>
            </div>
            <div className="field">
              <label>Application Area</label>
              <input value={appArea} onChange={(e) => setAppArea(e.target.value)} />
            </div>
            <div className="field">
              <label>CenterID</label>
              <input value={centerId} onChange={(e) => setCenterId(e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="Excel Template">
          <div className="grid">
            <div className="field">
              <label>Template Available</label>
              <button className="btn btn-outline" onClick={handleDownloadTemplate}>
                Download Excel Template →
              </button>
            </div>
            <div className="field">
              <label>
                Upload Excel File <span className="required">*</span>
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setExcelFile(e.target.files?.[0] ?? null)}
              />
              <div className="muted">Supports .xlsx, .xls, .csv</div>
              {!excelFile ? <div className="error">Excel file is required</div> : null}
            </div>
          </div>
        </Section>

        <Section title="Evidence Details" className="relative">
          {evidenceItems.map((item, idx) => (
            <div key={idx} className="evidence-row">
              <div className="grid">
                <div className="field">
                  <label>Evidence Category</label>
                  <select
                    value={item.category}
                    onChange={(e) =>
                      setEvidenceItems((arr) =>
                        arr.map((x, i) => (i === idx ? { ...x, category: e.target.value } : x))
                      )
                    }
                  >
                    <option>BoKS Entitlements (AIMS)</option>
                    <option>Access Review (Quarterly)</option>
                    <option>User Provisioning Evidence</option>
                  </select>
                </div>
                <div className="field">
                  <label>
                    Screenshot Source <span className="required">*</span>
                  </label>
                  <input
                    placeholder="Enter screenshot source"
                    value={item.screenshotSource}
                    onChange={(e) =>
                      setEvidenceItems((arr) =>
                        arr.map((x, i) =>
                          i === idx ? { ...x, screenshotSource: e.target.value } : x
                        )
                      )
                    }
                  />
                </div>
                <div className="field">
                  <label>Attachment Type (Optional)</label>
                  <input
                    placeholder="e.g., PNG, JPEG"
                    value={item.attachmentType}
                    onChange={(e) =>
                      setEvidenceItems((arr) =>
                        arr.map((x, i) => (i === idx ? { ...x, attachmentType: e.target.value } : x))
                      )
                    }
                  />
                </div>
              </div>
              <FileDropzone
                label="Upload Evidence Images"
                accept="image/*"
                required
                onFiles={(files) =>
                  setEvidenceItems((arr) =>
                    arr.map((x, i) => (i === idx ? { ...x, images: [...x.images, ...files] } : x))
                  )
                }
              />
              {item.images.length > 0 ? (
                <div className="thumbs">
                  {item.images.map((img, i) => (
                    <div key={i} className="thumb">
                      <span title={img.name}>{img.name}</span>
                      <button
                        className="btn btn-icon"
                        onClick={() =>
                          setEvidenceItems((arr) =>
                            arr.map((x, k) =>
                              k === idx
                                ? { ...x, images: x.images.filter((_, j) => j !== i) }
                                : x
                            )
                          )
                        }
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <div className="row-actions">
            <button
              className="btn btn-outline"
              onClick={() =>
                setEvidenceItems((arr) => [
                  ...arr,
                  { category: "BoKS Entitlements (AIMS)", screenshotSource: "", attachmentType: "", images: [] }
                ])
              }
              aria-label="Add evidence row"
            >
              +
            </button>
          </div>
        </Section>

        <div className="actions">
          <button className="btn btn-primary" disabled={requiredMissing} onClick={handleSubmit}>
            Submit Evidence
          </button>
          {requiredMissing ? (
            <div className="muted">
              Please fill in all required fields to submit the form
            </div>
          ) : null}
        </div>
      </main>

      <footer className="footer">
        <div>Version: 1.0.0</div>
        <div>Powered by React + Node.js</div>
      </footer>
    </div>
  );
}

