export default function Home() {
  const pink = "#b94f78";
  const brown = "#38251f";
  const collections = [
    { icon: "✦", title: "Curated Products", sub: "Handpicked for you" },
    { icon: "♡", title: "Made for Everyday", sub: "Discover what you love" },
    { icon: "⌂", title: "Shop from Home", sub: "Easy online browsing" },
    { icon: "✿", title: "New Arrivals", sub: "More coming soon" }
  ];
  return (
    <main style={{ minHeight: "100vh", background: "#fff", color: brown, fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: brown, color: "#fff", textAlign: "center", padding: "9px 16px", fontSize: 12 }}>
        Welcome to CHHOYA • ছোঁয়ায় থাকুক ভালোবাসা
      </div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px max(20px, calc((100% - 1100px)/2))", borderBottom: "1px solid #f0e7e9" }}>
        <a href="/" style={{ textDecoration: "none", color: pink, fontWeight: 800, fontSize: 28, letterSpacing: 1 }}>CHHOYA</a>
        <a href="#collections" style={{ color: brown, fontSize: 14, textDecoration: "none", fontWeight: 600 }}>Explore Shop ↓</a>
      </header>
      <section style={{ padding: "70px 20px", textAlign: "center", background: "linear-gradient(135deg, #fff3f7 0%, #fff 70%, #fce5ed 100%)" }}>
        <p style={{ color: pink, fontWeight: 700, letterSpacing: 2, fontSize: 12 }}>WELCOME TO CHHOYA</p>
        <h1 style={{ fontSize: "clamp(34px, 7vw, 60px)", lineHeight: 1.13, margin: "16px auto", maxWidth: 720 }}>Your everyday finds, <span style={{ color: pink }}>chosen with love.</span></h1>
        <p style={{ fontSize: 19, margin: "0 auto 12px", maxWidth: 580 }}>ছোঁয়া — আপনার পছন্দের অনলাইন শপিং স্টোর</p>
        <p style={{ color: "#78665f", fontSize: 15, maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.7 }}>Explore our growing collection. Simple shopping, delivered with care across India.</p>
        <a href="#collections" style={{ display: "inline-block", background: pink, color: "#fff", borderRadius: 30, padding: "15px 30px", fontWeight: 700, textDecoration: "none" }}>Explore Collections</a>
      </section>
      <section id="collections" style={{ maxWidth: 1100, margin: "auto", padding: "58px 20px" }}>
        <p style={{ textAlign: "center", color: pink, fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>DISCOVER CHHOYA</p>
        <h2 style={{ textAlign: "center", fontSize: 30, margin: "8px 0" }}>Shop Our Collections</h2>
        <p style={{ textAlign: "center", color: "#78665f", marginBottom: 30 }}>আমাদের নতুন কালেকশন দেখুন</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18 }}>
          {collections.map((item) => (
            <div key={item.title} style={{ background: "#fff7f9", border: "1px solid #f5dfe6", borderRadius: 18, padding: "36px 22px", textAlign: "center" }}>
              <div style={{ fontSize: 38, color: pink, marginBottom: 14 }}>{item.icon}</div>
              <h3 style={{ fontSize: 19, margin: "0 0 9px" }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "#78665f", margin: 0 }}>{item.sub}</p>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: "#78665f", marginTop: 26 }}>Product listings and checkout are being prepared.</p>
      </section>
      <section style={{ background: "#fff3f7", textAlign: "center", padding: "45px 20px" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 26 }}>A little touch of happiness</h2>
        <p style={{ margin: 0, color: "#78665f" }}>CHHOYA • ছোঁয়া</p>
      </section>
      <footer style={{ background: brown, color: "#fff", padding: "30px 20px", textAlign: "center", fontSize: 13 }}>© 2026 CHHOYA. All rights reserved.</footer>
    </main>
  );
}
