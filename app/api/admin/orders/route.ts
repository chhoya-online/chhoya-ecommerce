import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ADMIN_EMAIL = "chhoyakatwa26@gmail.com";
const allowedStatuses = ["new", "processing", "shipped", "delivered", "cancelled"];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server configuration is incomplete.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function authorize(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;

  const admin = getAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user?.email || data.user.email.toLowerCase() !== ADMIN_EMAIL) return null;
  return admin;
}

export async function GET(request: Request) {
  try {
    const admin = await authorize(request);
    if (!admin) return NextResponse.json({ error: "অনুমতি নেই। Admin login করুন।" }, { status: 401 });

    const { data, error } = await admin
      .from("orders")
      .select("id,customer_name,phone,shipping_address,total_amount,payment_method,payment_status,order_status,created_at,order_items(id,product_name,quantity,price)")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: "অর্ডার লোড করা যায়নি।" }, { status: 500 });
    return NextResponse.json({ orders: data || [] });
  } catch {
    return NextResponse.json({ error: "সার্ভার সমস্যা হয়েছে।" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await authorize(request);
    if (!admin) return NextResponse.json({ error: "অনুমতি নেই। Admin login করুন।" }, { status: 401 });

    const body = await request.json();
    const id = Number(body?.id);
    const status = String(body?.status || "");
    if (!Number.isSafeInteger(id) || id < 1 || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "অর্ডার বা স্ট্যাটাস সঠিক নয়।" }, { status: 400 });
    }

    const { data, error } = await admin
      .from("orders")
      .update({ order_status: status })
      .eq("id", id)
      .select("id,order_status")
      .single();

    if (error || !data) return NextResponse.json({ error: "স্ট্যাটাস আপডেট করা যায়নি।" }, { status: 500 });
    return NextResponse.json({ success: true, order: data });
  } catch {
    return NextResponse.json({ error: "সার্ভার সমস্যা হয়েছে।" }, { status: 500 });
  }
}
