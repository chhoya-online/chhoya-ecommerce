"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "chhoyakatwa26@gmail.com";
const pink = "#b94f78";
const brown = "#38251f";
const statuses = [
  { value: "new", label: "New" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  shipping_address: { address?: string; city?: string; state?: string; pincode?: string; country?: string } | string;
  total_amount: number | string;
  payment_method: string | null;
  payment_status: string | null;
  order_status: string | null;
  created_at: string;
  order_items: { id: number; product_name: string; quantity: number; price: number | string }[];
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export default function AdminPage() {
  const supabase = useMemo(() => getClient(), []);
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const loadOrders = useCallback(async () => {
    if (!session?.access_token) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "অর্ডার লোড করা যায়নি।");
      setOrders(result.orders || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "সমস্যা হয়েছে।");
    } finally {
      setBusy(false);
    }
  }, [session]);

  useEffect(() => { if (session) loadOrders(); }, [session, loadOrders]);

  async function sendLoginLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) { setMessage("Supabase configuration পাওয়া যায়নি।"); return; }
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) { setMessage("এই ইমেলটি Admin হিসেবে অনুমোদিত নয়।"); return; }
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: ADMIN_EMAIL,
      options: { emailRedirectTo: "https://chhoya.in/admin" },
    });
    setBusy(false);
    setMessage(error ? error.message : "আপনার Gmail-এ লগইন লিঙ্ক পাঠানো হয়েছে। Inbox বা Spam ফোল্ডার দেখুন।");
  }

  async function updateStatus(id: number, status: string) {
    if (!session?.access_token) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "স্ট্যাটাস বদলানো যায়নি।");
      setOrders((current) => current.map((order) => order.id === id ? { ...order, order_status: status } : order));
      setMessage(`Order #${id} status updated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "সমস্যা হয়েছে।");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setOrders([]);
  }

  const visibleOrders = filter === "all" ? orders : orders.filter((order) => (order.order_status || "new") === filter);
  const addressText = (address: Order["shipping_address"]) => {
    if (typeof address === "string") return address;
    return [address?.address, address?.city, address?.state, address?.pincode, address?.country].filter(Boolean).join(", ");
  };

  if (!supabase) return <main style={{ padding: 24, color: brown }}>Supabase configuration পাওয়া যায়নি।</main>;

  return (
    <main style={{ minHeight: "100vh", background: "#fff8fa", color: brown, fontFamily: "Arial, sans-serif", padding: "24px 16px 50px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <div><div style={{ color: pink, fontWeight: 800, letterSpacing: 2 }}>CHHOYA</div><h1 style={{ margin: "6px 0", fontSize: 28 }}>Admin Dashboard</h1><p style={{ margin: 0, color: "#78665f" }}>অর্ডার পরিচালনা</p></div>
          {session && <button onClick={signOut} style={{ border: "1px solid #e8dce0", background: "#fff", borderRadius: 20, padding: "10px 16px", color: brown }}>Logout</button>}
        </header>

        {!session ? (
          <form onSubmit={sendLoginLink} style={{ maxWidth: 460, margin: "48px auto", background: "#fff", padding: 24, border: "1px solid #f0dfe5", borderRadius: 18, boxShadow: "0 8px 28px rgba(56,37,31,.05)" }}>
            <h2 style={{ marginTop: 0 }}>Admin Login</h2>
            <p style={{ color: "#78665f", lineHeight: 1.6 }}>অনুমোদিত Admin Gmail-এ নিরাপদ লগইন লিঙ্ক পাঠানো হবে।</p>
            <label htmlFor="admin-email" style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>Admin Email</label>
            <input id="admin-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} style={{ width: "100%", boxSizing: "border-box", border: "1px solid #e8dce0", borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 14 }} />
            <button disabled={busy} type="submit" style={{ width: "100%", border: 0, borderRadius: 24, padding: 14, background: pink, color: "#fff", fontWeight: 700, fontSize: 16 }}>{busy ? "পাঠানো হচ্ছে…" : "Send Login Link"}</button>
            {message && <p role="status" style={{ background: "#fff7f9", padding: 12, borderRadius: 10, lineHeight: 1.5 }}>{message}</p>}
          </form>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, background: "#fff", border: "1px solid #f0dfe5", borderRadius: 14, padding: 16, marginBottom: 18 }}>
              <div><strong>{session.user?.email}</strong><div style={{ color: "#78665f", fontSize: 13, marginTop: 4 }}>{orders.length}টি অর্ডার (সর্বশেষ ২০০টি)</div></div>
              <button onClick={loadOrders} disabled={busy} style={{ border: 0, borderRadius: 20, padding: "10px 16px", background: pink, color: "#fff", fontWeight: 700 }}>↻ Refresh</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {[{ value: "all", label: "All Orders" }, ...statuses].map((item) => <button key={item.value} onClick={() => setFilter(item.value)} style={{ border: filter === item.value ? 0 : "1px solid #eadde2", borderRadius: 20, padding: "9px 14px", background: filter === item.value ? pink : "#fff", color: filter === item.value ? "#fff" : brown }}>{item.label}</button>)}
            </div>
            {message && <p role="status" style={{ background: "#fff", border: "1px solid #f0dfe5", padding: 12, borderRadius: 10 }}>{message}</p>}
            {busy && orders.length === 0 ? <p>অর্ডার লোড হচ্ছে…</p> : visibleOrders.length === 0 ? <div style={{ background: "#fff", borderRadius: 14, padding: 28, textAlign: "center", color: "#78665f" }}>এই বিভাগে কোনও অর্ডার নেই।</div> : (
              <div style={{ display: "grid", gap: 14 }}>
                {visibleOrders.map((order) => (
                  <article key={order.id} style={{ background: "#fff", border: "1px solid #f0dfe5", borderRadius: 16, padding: 18, boxShadow: "0 5px 18px rgba(56,37,31,.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <h2 style={{ margin: 0, fontSize: 21 }}>Order #{order.id}</h2>
                      <strong style={{ color: pink, fontSize: 20 }}>₹{Number(order.total_amount).toFixed(2)}</strong>
                    </div>
                    <p style={{ color: "#78665f", fontSize: 13 }}>{new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    <div style={{ lineHeight: 1.7 }}>
                      <strong>{order.customer_name}</strong><br />
                      <a href={`tel:${order.phone}`} style={{ color: pink }}>{order.phone}</a><br />
                      <span>{addressText(order.shipping_address)}</span>
                    </div>
                    <div style={{ background: "#fff8fa", borderRadius: 10, padding: 12, margin: "14px 0" }}>
                      <strong>Products</strong>
                      {(order.order_items || []).map((item) => <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 8, fontSize: 14 }}><span>{item.product_name} × {item.quantity}</span><span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span></div>)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ color: "#78665f", fontSize: 13 }}>Payment: {order.payment_method || "COD"} · {order.payment_status || "pending"}</span>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700 }}>Status
                        <select value={order.order_status || "new"} onChange={(event) => updateStatus(order.id, event.target.value)} disabled={busy} style={{ border: "1px solid #e8dce0", borderRadius: 9, padding: 9, background: "#fff", color: brown }}>
                          {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                        </select>
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
