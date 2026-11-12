
import { useState } from "react";
import {
  ShieldCheck, Search, FileText, Building2, HeartPulse,
  GraduationCap, Construction, ArrowRight, Menu, X,
  CheckCircle2, Clock3, Users, MessageSquareText
} from "lucide-react";
import "./App.css";

const departments = [
  { name: "Local Self Government", icon: Building2, desc: "Roads, drainage, sanitation and local civic services." },
  { name: "Health Services", icon: HeartPulse, desc: "Public hospitals, healthcare facilities and medical services." },
  { name: "Education", icon: GraduationCap, desc: "Government schools, colleges and educational facilities." },
  { name: "Public Works", icon: Construction, desc: "Road maintenance, bridges and public infrastructure." },
];

function App() {
  const [adminKey, setAdminKey] = useState("");
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [page, setPage] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [tracking, setTracking] = useState(false);
  const [grievance, setGrievance] = useState({
    district: "", category: "", subject: "", description: ""
  });
  const [message, setMessage] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Admin dashboard state
  const [grievances, setGrievances] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  
  async function loadGrievances(key = adminKey) {
    setDashboardLoading(true);
    setDashboardError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/grievances", {
        headers: {
          "X-Admin-Key": key,
        },
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Could not load grievances."
        );
      }

      setGrievances(Array.isArray(data) ? data : []);
    } catch (error) {
      setDashboardError(error.message || "Could not load grievances.");
    } finally {
      setDashboardLoading(false);
    }
  }


  async function changeGrievanceStatus(referenceId, status) {
    setDashboardError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/grievances/${encodeURIComponent(referenceId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Admin-Key": adminKey,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Could not update grievance status."
        );
      }

      await loadGrievances();
    } catch (error) {
      setDashboardError(error.message || "Could not update grievance status.");
    }
  }
  
  

  const navigate = (nextPage) => {
    setPage(nextPage);
    setMenuOpen(false);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function submitGrievance(e) {
    e.preventDefault();
    setMessage("Submitting grievance...");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grievance),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Submission failed");
      setMessage(`Submitted successfully! Reference: ${data.reference_id}`);
      setGrievance({ district: "", category: "", subject: "", description: "" });
    } catch (error) {
      setMessage(`Could not submit: ${error.message}. Check that the backend is running.`);
    }
  }


  async function analyzeGrievance() {
  if (!grievance.description || grievance.description.trim().length < 10) {
    setMessage("Please enter a grievance description of at least 10 characters.");
    return;
  }

  setMessage("AI is analyzing your grievance...");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: grievance.description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "AI analysis failed");
    }

    const analysis = data.analysis;

    setAiAnalysis(analysis);

    setGrievance((previous) => ({
      ...previous,
      category: analysis.category,
    }));

    setMessage("AI analysis completed successfully!");


    setGrievance((previous) => ({
      ...previous,
      category: analysis.category,
    }));

    setMessage(
      `AI Analysis Complete!\nCategory: ${analysis.category}\nDepartment: ${analysis.department}\nPriority: ${analysis.priority}\nSummary: ${analysis.summary}`
    );
  } catch (error) {
    setMessage(`AI analysis failed: ${error.message}`);
  }
}

  async function trackGrievance(e) {
    e.preventDefault();
    setTracking(true);
    setMessage("Searching...");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/grievances/${encodeURIComponent(reference)}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Reference not found");
      setMessage(`Status: ${data.status} | Department: ${data.department || "Awaiting assignment"}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const navItems = ["Home", "About Us", "How It Works", "Departments", "Contact Us", "FAQ"];

  return (
    <div className="app">
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Government service demonstration portal</span>
          <span>Kerala, India · Citizen Services</span>
        </div>
      </div>

      <header className="header">
        <div className="container header-inner">
          <button className="brand" onClick={() => navigate("Home")}>
            <span className="brand-mark"><ShieldCheck size={29} /></span>
            <span>
              <strong>JANASEVANA</strong>
              <small>PUBLIC GRIEVANCE PORTAL</small>
            </span>
          </button>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X /> : <Menu />}
          </button>

          <nav className={menuOpen ? "nav open" : "nav"}>
            {navItems.map(item => (
              <button key={item} className={page === item ? "nav-link active" : "nav-link"}
                onClick={() => navigate(item)}>{item}</button>
            ))}
          </nav>
          <button className="nav-submit" onClick={() => navigate("Submit Grievance")}>
            Submit Grievance <ArrowRight size={16} />
          </button>
          <button
            className="nav-submit admin-nav-button"
            onClick={() => {
              navigate("Admin Dashboard");
              loadGrievances();
            }}
          >
            Admin Demo
          </button>
        </div>
      </header>

      <main>
        {page === "Admin Dashboard" && (
          <section className="section page-section">
            <div className="container">
              <span className="eyebrow dark">JANASEVANA · ADMIN DEMO</span>
              <h1>Grievance Dashboard</h1>
              <p>View submitted grievances and update their current status.</p>
              
              
              <div className="info-card" style={{ marginBottom: "24px" }}>
                <h3>Administrator access</h3>
                <p>Enter the admin key to load and manage grievance records.</p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setAdminKey(adminKeyInput);
                    setGrievances([]);
                    await loadGrievances(adminKeyInput);
                  }}
                >
                  <input
                    type="password"
                    value={adminKeyInput}
                    onChange={(e) => setAdminKeyInput(e.target.value)}
                    placeholder="Enter admin key"
                    autoComplete="current-password"
                    required
                    style={{ marginBottom: "12px" }}
                  />

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={dashboardLoading}
                  >
                    {dashboardLoading ? "Checking key..." : "Unlock dashboard"}
                  </button>
                </form>
              </div>



              <div className="dashboard-stats">
                <div className="info-card">
                  <h3>{grievances.length}</h3>
                  <p>Total grievances</p>
                </div>
                <div className="info-card">
                  <h3>
                    {grievances.filter(
                      (g) => !["Resolved", "Rejected"].includes(g.status)
                    ).length}
                  </h3>
                  <p>Open grievances</p>
                </div>
                <div className="info-card">
                  <h3>
                    {grievances.filter((g) => g.status === "Resolved").length}
                  </h3>
                  <p>Resolved grievances</p>
                </div>
              </div>

              <div className="dashboard-toolbar">
                <p>Records are loaded from the connected database.</p>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={loadGrievances}
                  disabled={dashboardLoading}
                >
                  {dashboardLoading ? "Refreshing..." : "Refresh records"}
                </button>
              </div>

              {dashboardError && (
                <p className="form-message" role="alert">{dashboardError}</p>
              )}

              {dashboardLoading && <p>Loading grievance records...</p>}

              {!dashboardLoading && grievances.length === 0 && !dashboardError && (
                <div className="info-card">
                  <h3>No grievances found</h3>
                  <p>Submitted grievances will appear here.</p>
                </div>
              )}

              {grievances.length > 0 && (
                <div className="dashboard-table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>District</th>
                        <th>Grievance</th>
                        <th>Department</th>
                        <th>Submitted</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grievances.map((g) => (
                        <tr key={g.reference_id}>
                          <td className="reference-cell">{g.reference_id}</td>
                          <td>{g.district}</td>
                          <td>
                            <strong>{g.subject}</strong>
                            <p>{g.description}</p>
                            <small>Category: {g.category}</small>
                          </td>
                          <td>{g.department || "Awaiting assignment"}</td>
                          <td>
                            {g.created_at
                              ? new Date(g.created_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td>
                            <select
                              aria-label={`Status for ${g.reference_id}`}
                              value={g.status}
                              onChange={(e) =>
                                changeGrievanceStatus(g.reference_id, e.target.value)
                              }
                            >
                              {[
                                "Submitted",
                                "Under Review",
                                "Assigned",
                                "In Progress",
                                "Resolved",
                                "Rejected",
                              ].map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="dashboard-disclaimer">
                Demonstration only: this dashboard has no administrator login and
                must not be used for real citizen data or deployed as a secure public service.
              </p>
            </div>
          </section>
        )}

        {page === "Home" && <>
          <section className="hero">
            <div className="hero-pattern" />
            <div className="container hero-content">
              <div className="hero-copy">
                <div className="eyebrow"><span className="live-dot" /> CITIZEN FIRST · TRANSPARENT GOVERNANCE</div>
                <h1>Your voice matters.<br /><span>We are here to listen.</span></h1>
                <p>A simple, transparent way for citizens to raise public grievances, track progress and stay informed about the action taken.</p>
                <div className="hero-actions">
                  <button className="btn btn-gold" onClick={() => navigate("Submit Grievance")}>
                    <FileText size={18} /> Submit a Grievance
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate("Track Grievance")}>
                    <Search size={18} /> Track Your Grievance
                  </button>
                </div>
                <div className="trust-note"><ShieldCheck size={17} /> A transparent and accountable service experience</div>
              </div>
              <div className="hero-card">
                <div className="hero-card-icon"><MessageSquareText size={27} /></div>
                <span className="card-kicker">YOUR CONCERN, OUR PRIORITY</span>
                <h3>Every grievance deserves attention.</h3>
                <p>From submission to resolution, follow the journey of your complaint with a unique reference number.</p>
                <div className="mini-steps">
                  <div><span>01</span><p>Submit</p></div>
                  <ArrowRight size={16} />
                  <div><span>02</span><p>Review</p></div>
                  <ArrowRight size={16} />
                  <div><span>03</span><p>Resolve</p></div>
                </div>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <div className="container stats-grid">
              <div className="stat"><span className="stat-icon"><FileText /></span><div><strong>Transparent</strong><span>Grievance tracking</span></div></div>
              <div className="stat"><span className="stat-icon"><Clock3 /></span><div><strong>Step by step</strong><span>Status updates</span></div></div>
              <div className="stat"><span className="stat-icon"><Users /></span><div><strong>Citizen focused</strong><span>Accessible services</span></div></div>
              <div className="stat"><span className="stat-icon"><CheckCircle2 /></span><div><strong>Accountable</strong><span>Action monitoring</span></div></div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="section-heading">
                <div><span className="eyebrow dark">PUBLIC SERVICES</span><h2>How can we help you?</h2>
                  <p>Choose a department related to your concern to get started.</p></div>
                <button className="text-button" onClick={() => navigate("Departments")}>View all departments <ArrowRight size={16} /></button>
              </div>
              <div className="department-grid">
                {departments.map(({ name, icon: Icon, desc }) => (
                  <button className="department-card" key={name} onClick={() => {
                    setGrievance(g => ({ ...g, category: name }));
                    navigate("Submit Grievance");
                  }}>
                    <span className="department-icon"><Icon size={24} /></span>
                    <h3>{name}</h3><p>{desc}</p>
                    <span className="card-link">Raise a concern <ArrowRight size={15} /></span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="cta-section"><div className="container cta-inner">
            <div><span className="eyebrow">WE ARE HERE TO HELP</span><h2>Have a concern to raise?</h2>
              <p>Submit your grievance and keep track of its progress.</p></div>
            <button className="btn btn-gold" onClick={() => navigate("Submit Grievance")}>Get Started <ArrowRight size={17} /></button>
          </div></section>
        </>}

        {page === "Submit Grievance" && <section className="section page-section"><div className="container form-container">
          <span className="eyebrow dark">CITIZEN SERVICES</span><h1>Submit a Grievance</h1>
          <p>Describe your concern clearly. Fields marked with * are required.</p>
          <form className="portal-form" onSubmit={submitGrievance}>
            <label>District *<select required value={grievance.district} onChange={e => setGrievance({...grievance, district:e.target.value})}>
              <option value="">Select your district</option>
              {["Thiruvananthapuram","Kollam","Pathanamthitta","Alappuzha","Kottayam","Idukki","Ernakulam","Thrissur","Palakkad","Malappuram","Kozhikode","Wayanad","Kannur","Kasaragod"].map(d => <option key={d}>{d}</option>)}
            </select></label>
            <label>Grievance category *<select required value={grievance.category} onChange={e => setGrievance({...grievance,category:e.target.value})}>
              <option value="">Select category</option>{departments.map(d => <option key={d.name}>{d.name}</option>)}
              <option>Public Distribution</option><option>Water Supply</option><option>Other</option>
            </select></label>
            <label>Subject *<input required maxLength={180} value={grievance.subject} onChange={e => setGrievance({...grievance,subject:e.target.value})} placeholder="Briefly describe the issue" /></label>
            <label>Detailed description *<textarea required minLength={10} rows={6} value={grievance.description} onChange={e => setGrievance({...grievance,description:e.target.value})} placeholder="Explain what happened, where it occurred, and what action is needed." /></label>
            <button
              type="button"
              className="btn btn-gold"
              onClick={analyzeGrievance}
            >
            ✨ Analyze with AI
            </button>

            {aiAnalysis && (
              <div className="ai-result-card">
                <h3>✨ AI Grievance Analysis</h3>

                <p>
                  <strong>Category:</strong> {aiAnalysis.category}
                </p>

                <p>
                  <strong>Department:</strong> {aiAnalysis.department}
                </p>

                <p>
                  <strong>Priority:</strong>{" "}
                  <span className={`priority-${aiAnalysis.priority.toLowerCase()}`}>
                    {aiAnalysis.priority}
                  </span>
                </p>

                <p>
                  <strong>Summary:</strong> {aiAnalysis.summary}
                </p>

                <p className="ai-disclaimer">
                  AI-generated suggestions may need verification before submission.
                </p>
              </div>
            )}

            <button className="btn btn-primary" type="submit">Submit Grievance <ArrowRight size={17}/></button>
            {message && <p className="form-message" role="status">{message}</p>}
          </form>
        </div></section>}

        {page === "Track Grievance" && <section className="section page-section"><div className="container form-container">
          <span className="eyebrow dark">GRIEVANCE STATUS</span><h1>Track Your Grievance</h1>
          <p>Enter the reference number you received when submitting your grievance.</p>
          <form className="portal-form" onSubmit={trackGrievance}>
            <label>Grievance reference number<input required value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g. KPG-2026-ABC123" /></label>
            <button className="btn btn-primary" type="submit"><Search size={17}/> Track Status</button>
            {message && <p className="form-message" role="status">{message}</p>}
          </form>
        </div></section>}

        {page !== "Home" && page !== "Submit Grievance" && page !== "Track Grievance" && page !== "Admin Dashboard" && <section className="section page-section"><div className="container">
          <span className="eyebrow dark">JANASEVANA PORTAL</span><h1>{page}</h1>
          {page === "Departments" ? <div className="department-grid">{departments.map(({name,icon:Icon,desc})=><article className="department-card" key={name}><span className="department-icon"><Icon size={24}/></span><h3>{name}</h3><p>{desc}</p></article>)}</div>
          : page === "How It Works" ? <div className="info-card"><h3>Simple, transparent grievance handling</h3><p>1. Submit your grievance and receive a reference number.</p><p>2. The CMO reviews the grievance and assigns the relevant department.</p><p>3. The department investigates and records its action taken.</p><p>4. The CMO reviews progress and updates the grievance status.</p></div>
          : page === "FAQ" ? <div className="info-card"><h3>How do I submit a grievance?</h3><p>Use the Submit Grievance option and complete all required fields.</p><h3>How can I track progress?</h3><p>Use your grievance reference number in Track Your Grievance.</p><h3>Does submission guarantee resolution?</h3><p>No. Each grievance requires review by the relevant authority.</p></div>
          : page === "Contact Us" ? <div className="info-card"><p>This prototype demonstrates a public grievance service. Contact form integration will be added with the backend.</p></div>
          : <div className="info-card"><p>Janasevana is a recruitment prototype demonstrating how citizens could submit and track public grievances through a transparent digital workflow. This application is not an official Government of Kerala website.</p><p><strong>Our objective:</strong> Make grievance submission easier, improve traceability, and help officers monitor actions and outcomes.</p></div>}
        </div></section>}
      </main>

      <footer className="footer"><div className="container footer-main">
        <div className="footer-brand"><div className="brand-mark"><ShieldCheck size={25}/></div><div><strong>JANASEVANA</strong><p>Public Grievance Redressal Portal</p></div></div>
        <p>A recruitment prototype. Not an official Government of Kerala service.</p>
      </div><div className="footer-bottom"><div className="container">© 2026 Janasevana Prototype · Built for demonstration purposes</div></div></footer>
    </div>
  );
}

export default App;
