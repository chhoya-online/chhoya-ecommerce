
export default function Home() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", background: "#fff", minHeight: "100vh", color: "#38251f" }}>
      <header style={{ padding: "20px", textAlign: "center", borderBottom: "1px solid #eee" }}>
        <h1 style={{ color: "#b94f78", fontSize: "32px", margin: 0 }}>CHHOYA</h1>
        <p style={{ margin: "6px 0" }}>ছোঁয়া — Online Shopping Store</p>
      </header>

      <section style={{ padding: "55px 20px", textAlign: "center", background: "#fff5f8" }}>
        <h2>Welcome to CHHOYA</h2>
        <p>Discover products you will love.</p>
        <p>আপনার পছন্দের পণ্য খুঁজে নিন।</p>
        <button style={{ background: "#b94f78", color: "white", border: 0, padding: "14px 28px", borderRadius: "8px", fontSize: "16px" }}>
          Shop Now
        </button>
      </section>

      <section style={{ padding: "30px 20px", textAlign: "center" }}>
        <h2>Our Categories</h2>
        <p>Explore our latest collections.</p>
        <p>নতুন নতুন কালেকশন দেখুন।</p>
      </section>

      <footer style={{ padding: "25px", textAlign: "center", background: "#38251f", color: "white" }}>
        © 2026 CHHOYA. All rights reserved.
      </footer>
    </main>
  );
}
