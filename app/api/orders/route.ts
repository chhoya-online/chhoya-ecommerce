import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ItemInput = { productId: number; quantity: number };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, address, city, state, pincode, items, website } = body ?? {};

    // Honeypot field: real customers leave this empty.
    if (website) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    if (
      typeof fullName !== "string" || fullName.trim().length < 2 || fullName.trim().length > 100 ||
      typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone.trim()) ||
      typeof address !== "string" || address.trim().length < 8 || address.trim().length > 500 ||
      typeof city !== "string" || city.trim().length < 2 || city.trim().length > 80 ||
      typeof state !== "string" || state.trim().length < 2 || state.trim().length > 80 ||
      typeof pincode !== "string" || !/^\d{6}$/.test(pincode.trim()) ||
      !Array.isArray(items) || items.length < 1 || items.length > 30
    ) {
      return NextResponse.json({ error: "দয়া করে সব তথ্য সঠিকভাবে পূরণ করুন।" }, { status: 400 });
    }

    const normalized: ItemInput[] = [];
    for (const item of items) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);
      if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) {
        return NextResponse.json({ error: "কার্টের পণ্যের তথ্য সঠিক নয়।" }, { status: 400 });
      }
      const existing = normalized.find((x) => x.productId === productId);
      if (existing) existing.quantity += quantity;
      else normalized.push({ productId, quantity });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "অর্ডার ব্যবস্থা এখনও সেটআপ করা হয়নি। অনুগ্রহ করে পরে চেষ্টা করুন।" }, { status: 503 });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const ids = normalized.map((item) => item.productId);
    const { data: products, error: productError } = await admin
      .from("products")
      .select("id,name,price,stock,is_active")
      .in("id", ids);

    if (productError || !products || products.length !== ids.length) {
      return NextResponse.json({ error: "কার্টের একটি বা একাধিক পণ্য আর উপলব্ধ নেই।" }, { status: 409 });
    }

    const orderItems = [];
    let total = 0;
    for (const item of normalized) {
      const product = products.find((p) => Number(p.id) === item.productId);
      if (!product || !product.is_active || Number(product.stock) < item.quantity) {
        return NextResponse.json({ error: "একটি পণ্যের পর্যাপ্ত স্টক নেই। কার্ট আপডেট করে আবার চেষ্টা করুন।" }, { status: 409 });
      }
      const price = Number(product.price);
      total += price * item.quantity;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price,
      });
    }

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: null,
        customer_name: fullName.trim(),
        phone: phone.trim(),
        shipping_address: {
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: "India",
        },
        total_amount: total,
        payment_method: "COD",
        payment_status: "pending",
        order_status: "new",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "অর্ডার তৈরি করা যায়নি। আবার চেষ্টা করুন।" }, { status: 500 });
    }

    const { error: itemsError } = await admin
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

    if (itemsError) {
      await admin.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "অর্ডারের পণ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।" }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: order.id, total }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "অনুরোধটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।" }, { status: 400 });
  }
}
