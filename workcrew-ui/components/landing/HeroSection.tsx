"use client";
import * as React from "react";
import { Container, Heading, Text, Button, Card } from "../primitives";

const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <Container>
        <div className="hero-grid">
          {/* LEFT */}
          <div className="left">
            <div className="chip"><span>⚡</span> The future of hiring is here</div>

            <h1 className="title">
              <span className="line1">Hiring or job hunting?</span>
              <span className="line2">You’re in the right place.</span>
            </h1>

            <Text className="sub">
              An AI-powered hiring experience that helps candidates find the right role
              and recruiters hire faster, smarter, better.
            </Text>

            <div className="actions">
              <Button variant="ghost" className="outline">↗ Find work</Button>
              <Button variant="primary" className="primary">↗ Start hiring</Button>
            </div>

            <ul className="stats">
              <li><strong>5,000+</strong><span>Candidates</span></li>
              <li><strong>500+</strong><span>Recruiters</span></li>
              <li><strong>300+</strong><span>Companies</span></li>
              <li><strong>400+</strong><span>Jobs Posted</span></li>
            </ul>
          </div>

          {/* RIGHT */}
          <div className="right">
            <Card elevation="lg" bordered className="panel">
              <div className="panel-header">
                <span className="badge">Work<span className="badge-pill">crew</span>.ai</span>
                <div className="avatar" />
              </div>

              <div className="block">
                <div className="block-title">Profile completion</div>
                <div className="progress"><div className="bar" style={{ width: "66%" }} /></div>
              </div>

              <div className="block">
                <div className="block-title">Job matches</div>
                <div className="list">
                  <div className="row">
                    <div>
                      <div className="role">Senior Frontend Developer</div>
                      <div className="meta">TechCorp • Remote • $120k–150k</div>
                    </div>
                    <button className="pill-btn">Apply</button>
                  </div>
                  <div className="row">
                    <div>
                      <div className="role">React Engineer</div>
                      <div className="meta">StartupXYZ • Hybrid • $100k–130k</div>
                    </div>
                    <button className="pill-btn">Apply</button>
                  </div>
                </div>
              </div>

              <div className="block">
                <div className="block-title">Recent Applications</div>
                <div className="list">
                  <div className="row">
                    <div className="role">Frontend Developer at InnovateLabs</div>
                    <span className="chip chip-warn">Under Review</span>
                  </div>
                  <div className="row">
                    <div className="role">React Engineer at DevCorp</div>
                    <span className="chip chip-good">Interview Scheduled</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>

      <style jsx>{`
        .hero {
          padding: 72px 0 56px;
          background:
            radial-gradient(120% 120% at 0% 0%, #f2f2ff 0%, #ffffff 70%),
            linear-gradient(#eaeefe 1px, transparent 1px),
            linear-gradient(90deg, #eaeefe 1px, transparent 1px);
          background-size: auto, 40px 40px, 40px 40px;
          background-position: center top, center top, center top;
        }

        /* ====== layout fix: two columns on >=768px ====== */
        .hero-grid {
          display: grid;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .hero-grid {
            grid-template-columns: minmax(0,1fr) minmax(420px, 520px);
            align-items: center;       /* keeps card vertically centered */
          }
        }

        .left { max-width: 720px; }
        .chip {
          display: inline-flex; align-items: center; gap: 8px;
          font-weight: 600; color: #335;
          background: #eef2ff; border: 1px solid rgba(79,70,229,0.25);
          border-radius: 999px; padding: 6px 10px;
        }

        .title { margin: 16px 0 0; line-height: 1.12; letter-spacing: -0.02em; }
        .line1 { display:block; font-weight:800; font-size:46px; color:#5743ff; }
        .line2 { display:block; margin-top:6px; font-weight:800; font-size:46px; color:#0b1020; }

        .sub { margin-top:14px; font-size:18px; color:#1e2a3a; opacity:.85; }

        .actions { display:flex; gap:12px; margin-top:22px; }
        :global(.outline){ border-radius:999px !important; padding:12px 18px !important;
          border:2px solid #6956ff !important; color:#4b3fff !important; background:transparent !important; }
        :global(.primary){ border-radius:999px !important; padding:12px 20px !important;
          background:linear-gradient(135deg,#6D5CF5 0%,#4F46E5 60%,#3B82F6 100%) !important;
          color:#fff !important; box-shadow:0 10px 28px rgba(79,70,229,0.35); font-weight:700; }

        .stats { margin:22px 0 0; padding:0; list-style:none; display:grid;
          grid-template-columns: repeat(4, auto); gap:18px 28px; }
        .stats li { color:#616a87; } .stats strong{ display:block; color:#2b2f43; font-size:16px; }

        .right{ display:flex; justify-content:flex-end; }
        .panel{
          width:100%; max-width:520px; border-radius:18px !important; padding:20px !important;
          background:rgba(255,255,255,0.9); border:1px solid rgba(20,20,40,0.08) !important;
        }
        .panel-header{ display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .badge{ font-weight:800; color:#0b1020; }
        .badge-pill{ padding:0 6px; border-radius:6px; color:#fff;
          background:linear-gradient(135deg,#6D5CF5 0%, #3B82F6 100%);}
        .avatar{ margin-left:auto; width:36px; height:36px; border-radius:50%;
          background: radial-gradient(120% 120% at 30% 20%, #e6e9ff 0%, #cfd9ff 60%); }

        .block{ margin-top:14px; } .block-title{ font-weight:700; color:#2b2f43; margin-bottom:8px; }
        .progress{ height:8px; border-radius:999px; background:#edf0ff; overflow:hidden; }
        .bar{ height:100%; background: linear-gradient(90deg,#7C6CFF,#3B82F6); }

        .list{ display:grid; gap:10px; }
        .row{ display:grid; grid-template-columns:1fr auto; align-items:center;
          padding:10px 12px; border:1px solid rgba(20,20,40,0.08); border-radius:12px; background:#fff; }
        .role{ font-weight:700; color:#1e233f; } .meta{ font-size:12px; color:#6b7280; }
        .pill-btn{ padding:8px 14px; border-radius:999px; border:none; cursor:pointer; color:#fff;
          background:linear-gradient(135deg,#6D5CF5,#3B82F6); box-shadow:0 6px 16px rgba(79,70,229,0.25); }

        .chip-warn{ border-radius:999px; padding:4px 10px; font-size:12px; color:#8a5c00; background:#fff7e6;
          border:1px solid rgba(255,183,0,.35); }
        .chip-good{ border-radius:999px; padding:4px 10px; font-size:12px; color:#066a35; background:#e6fff4;
          border:1px solid rgba(16,185,129,.35); }

        @media (max-width: 767px){
          .line1,.line2{ font-size:36px; }
          .stats{ grid-template-columns: repeat(2, auto); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
