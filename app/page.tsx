"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  stock: number;
  image_url: string | null;
  categories: { name: string }[] | null;
};

type CartItem = { product: Product; quantity: number };

const pink = "#b94f78";
const brown = "#38251f";
const fieldStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #e8dce0", borderRadius: 10, padding: "13px 14px", fontSize: 15, color: brown, background: "#fff" };

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [customer, setCustomer] = useState({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "", website: "" });
  const supabase = useMemo(() => getSupabase(), []);

  useEffect(() => {
    let alive = true;
    async function loadProducts() {
      if (!supabase) {
        setLoadError("আমাদের অনলাইন ক্যাটালগ সংযোগ করা হচ্ছে। খুব শীঘ্রই পণ্য দেখা যাবে।");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("products")
        .select("id,name,description,price,stock,image_url,categories(name)")
        .eq("is_active", true)
        .order("id", { ascending: true });
      if (!alive) return;
      if (error) {
        setLoadError("পণ্য লোড করা যাচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।");
      } else {
        setProducts((data || []) as Product[]);
        setLoadError("");
      }
      setLoading(false);
    }
    loadProducts();
    return () => { alive = false; };
  }, [supabase]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => item.product.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item);
      }
      return [...current, { product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function changeQuantity(productId: number, delta: number) {
    setCart((current) => current
      .map((item) => item.product.id === productId
        ? { ...item, quantity: item.quantity + delta }
        : item)
      .filter((item) => item.quantity > 0));
  }

  async function placeCodOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length || placingOrder) return;
    setPlacingOrder(true);
    setOrderMessage("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customer, items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "অর্ডার করা যায়নি।");
      setOrderMessage(`আপনার অর্ডার সফল হয়েছে! Order ID: ${result.orderId} • মোট ₹${Number(result.total).toFixed(2)}`);
      setCart([]);
      setCheckoutOpen(false);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "আবার চেষ্টা করুন।");
    } finally {
      setPlacingOrder(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff", color: brown, fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: brown, color: "#fff", textAlign: "center", padding: "9px 16px", fontSize: 13 }}>
        Welcome to CHHOYA • ছোঁয়ায় থাকুক ভালোবাসা
      </div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px max(20px, calc((100% - 1100px)/2))", borderBottom: "1px solid #f0e7e9", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
        <a href="/" style={{ textDecoration: "none", color: pink, fontWeight: 800, fontSize: 28, letterSpacing: 1 }}>CHHOYA</a>
        <button onClick={() => setCartOpen(!cartOpen)} style={{ border: "1px solid #f0d6e0", borderRadius: 24, background: "#fff7f9", color: brown, padding: "10px 16px", fontWeight: 700, cursor: "pointer" }}>
          🛍️ Cart ({cartCount})
        </button>
      </header>

      <section style={{ padding: "64px 20px", textAlign: "center", background: "linear-gradient(135deg, #fff3f7 0%, #fff 70%, #fce5ed 100%)" }}>
        <p style={{ color: pink, fontWeight: 700, letterSpacing: 2, fontSize: 13 }}>WELCOME TO CHHOYA</p>
        <h1 style={{ fontSize: "clamp(34px, 7vw, 60px)", lineHeight: 1.13, margin: "16px auto", maxWidth: 720 }}>Your everyday finds, <span style={{ color: pink }}>chosen with love.</span></h1>
        <p style={{ fontSize: 20, margin: "0 auto 12px", maxWidth: 580 }}>ছোঁয়া — আপনার পছন্দের অনলাইন শপিং স্টোর</p>
        <p style={{ color: "#78665f", fontSize: 15, maxWidth: 500, margin: "0 auto 26px", lineHeight: 1.7 }}>Explore our growing collection. Simple shopping, delivered with care across India.</p>
        <a href="#shop" style={{ display: "inline-block", background: pink, color: "#fff", borderRadius: 30, padding: "15px 30px", fontWeight: 700, textDecoration: "none" }}>Explore Products</a>
      </section>

      <section id="shop" style={{ maxWidth: 1100, margin: "auto", padding: "48px 20px 64px" }}>
        <p style={{ textAlign: "center", color: pink, fontSize: 12, letterSpacing: 2, fontWeight: 700 }}>DISCOVER CHHOYA</p>
        <h2 style={{ textAlign: "center", fontSize: 30, margin: "8px 0" }}>Shop Our Products</h2>
        <p style={{ textAlign: "center", color: "#78665f", marginBottom: 30 }}>আমাদের পছন্দের কালেকশন দেখুন</p>
        {loading ? (
          <p style={{ textAlign: "center", color: "#78665f", padding: 30 }}>পণ্য লোড হচ্ছে…</p>
        ) : loadError ? (
          <div style={{ background: "#fff7f9", border: "1px solid #f5dfe6", borderRadius: 16, padding: 24, textAlign: "center", color: "#78665f" }}>{loadError}</div>
        ) : products.length === 0 ? (
          <p style={{ textAlign: "center", color: "#78665f", padding: 30 }}>নতুন পণ্য খুব শীঘ্রই যোগ করা হবে।</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
            {products.map((product) => {
              const category = product.categories?.[0]?.name;
              return (
                <article key={product.id} style={{ border: "1px solid #f1e2e7", borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: "0 5px 20px rgba(56,37,31,.05)" }}>
                  <div style={{ height: 220, background: "#fff3f7", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 48, color: pink }}>♡</span>}
                  </div>
                  <div style={{ padding: 16 }}>
                    {category && <p style={{ color: pink, fontSize: 12, margin: "0 0 7px", fontWeight: 700 }}>{category}</p>}
                    <h3 style={{ fontSize: 17, margin: "0 0 8px" }}>{product.name}</h3>
                    {product.description && <p style={{ fontSize: 13, color: "#78665f", minHeight: 36, lineHeight: 1.5 }}>{product.description}</p>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 14 }}>
                      <strong style={{ fontSize: 19 }}>₹{Number(product.price).toFixed(0)}</strong>
                      <button disabled={product.stock < 1} onClick={() => addToCart(product)} style={{ border: 0, borderRadius: 22, background: product.stock < 1 ? "#ddd" : pink, color: "#fff", padding: "10px 14px", fontWeight: 700, cursor: product.stock < 1 ? "not-allowed" : "pointer" }}>
                        {product.stock < 1 ? "Out of stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {cartOpen && (
        <div role="dialog" aria-modal="true" aria-label="Shopping cart" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 30, display: "flex", justifyContent: "flex-end" }} onClick={() => setCartOpen(false)}>
          <div onClick={(event) => event.stopPropagation()} style={{ width: "min(100%, 420px)", height: "100%", background: "#fff", padding: 22, overflowY: "auto", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Your Cart ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart" style={{ border: 0, background: "transparent", fontSize: 26, cursor: "pointer" }}>×</button>
            </div>
            {cart.length === 0 ? <p style={{ color: "#78665f", padding: "30px 0" }}>আপনার Cart এখন খালি।</p> : (
              <>
                {cart.map((item) => (
                  <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #f1e2e7", padding: "16px 0" }}>
                    <div><strong>{item.product.name}</strong><p style={{ margin: "6px 0", color: "#78665f" }}>₹{Number(item.product.price).toFixed(0)}</p></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => changeQuantity(item.product.id, -1)} aria-label="Decrease quantity">−</button>
                      {item.quantity}
                      <button onClick={() => changeQuantity(item.product.id, 1)} aria-label="Increase quantity" disabled={item.quantity >= item.product.stock}>+</button>
                    </div>
                  </div>
                ))}
                <h3 style={{ textAlign: "right" }}>Total: ₹{cartTotal.toFixed(2)}</h3>
                {!checkoutOpen ? (
                  <button onClick={() => { setOrderMessage(""); setCheckoutOpen(true); }} style={{ width: "100%", marginTop: 12, border: 0, borderRadius: 26, background: pink, color: "#fff", padding: 15, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Proceed to Checkout</button>
                ) : (
                  <form onSubmit={placeCodOrder} style={{ display: "grid", gap: 12, marginTop: 20 }}>
                    <h3 style={{ margin: "4px 0" }}>Delivery Details</h3>
                    <input required minLength={2} maxLength={100} placeholder="আপনার পুরো নাম" value={customer.fullName} onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })} style={fieldStyle} />
                    <input required type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit mobile number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\\D/g, "").slice(0, 10) })} style={fieldStyle} />
                    <textarea required minLength={8} maxLength={500} placeholder="বাড়ি/রাস্তা/গ্রাম, সম্পূর্ণ ঠিকানা" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} style={{ ...fieldStyle, minHeight: 84, resize: "vertical" }} />
                    <input required minLength={2} maxLength={80} placeholder="City / Town" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} style={fieldStyle} />
                    <input required minLength={2} maxLength={80} placeholder="State" value={customer.state} onChange={(e) => setCustomer({ ...customer, state: e.target.value })} style={fieldStyle} />
                    <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6-digit PIN code" value={customer.pincode} onChange={(e) => setCustomer({ ...customer, pincode: e.target.value.replace(/\\D/g, "").slice(0, 6) })} style={fieldStyle} />
                    <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={customer.website} onChange={(e) => setCustomer({ ...customer, website: e.target.value })} style={{ display: "none" }} />
                    <div style={{ background: "#fff7f9", borderRadius: 12, padding: 14 }}><strong>Payment Method: Cash on Delivery</strong><p style={{ margin: "6px 0 0", color: "#78665f", fontSize: 13 }}>পণ্য হাতে পেয়ে টাকা দেবেন।</p></div>
                    <button type="submit" disabled={placingOrder} style={{ border: 0, borderRadius: 26, background: placingOrder ? "#aaa" : pink, color: "#fff", padding: 15, fontWeight: 700, fontSize: 16, cursor: placingOrder ? "wait" : "pointer" }}>{placingOrder ? "অর্ডার হচ্ছে…" : `Confirm COD Order • ₹${cartTotal.toFixed(2)}`}</button>
                    <button type="button" onClick={() => setCheckoutOpen(false)} style={{ border: "1px solid #e8dce0", borderRadius: 24, background: "#fff", color: brown, padding: 12, cursor: "pointer" }}>Back to Cart</button>
                  </form>
                )}
                {orderMessage && <p role="status" style={{ background: "#fff7f9", padding: 12, borderRadius: 12, color: brown, lineHeight: 1.5 }}>{orderMessage}</p>}
              </>
            )}
          </div>
        </div>
      )}

      <section style={{ background: "#fff3f7", textAlign: "center", padding: "40px 20px" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 25 }}>A little touch of happiness</h2>
        <p style={{ margin: 0, color: "#78665f" }}>CHHOYA • ছোঁয়া</p>
      </section>
      <footer style={{ background: brown, color: "#fff", padding: "28px 20px", textAlign: "center", fontSize: 13 }}>© 2026 CHHOYA. All rights reserved.</footer>
    </main>
  );
}
