import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "enquiries.json");

async function ensureDataFile() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf-8");
  }
}

async function validatePayload(payload) {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!payload.name || !payload.name.trim()) errors.push("Name is required");
  if (!payload.email || !emailRegex.test(payload.email)) errors.push("Valid email is required");
  if (!payload.phone || payload.phone.length!=10)
    errors.push("Valid phone number is required");
  if (!payload.program || !payload.program.trim()) errors.push("Program is required");
  ensureDataFile();
  const raw = await fs.readFile(dataFile, "utf-8");
  const items = JSON.parse(raw || "[]");
  items.map((item,i)=>{
  const emailRegistered = item.email===payload.email && item.program==payload.program
  const phoneRegistered = item.phone===payload.phone && item.program==payload.program
  if(emailRegistered&&phoneRegistered){
    errors.push("Email and phone number already registered.")
  }
  else if(emailRegistered){
      errors.push("Email already registered");
     }
  else if(phoneRegistered){
      errors.push("Mobile number already registered");
     };
  
  })

 
  return errors;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const errors =await validatePayload(body);
    if (errors.length) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
    }

    await ensureDataFile();
    const raw = await fs.readFile(dataFile, "utf-8");
    const items = JSON.parse(raw || "[]");

    const entry = {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      program: body.program.trim(),
      submittedAt: new Date().toISOString(),
    };

    items.push(entry);
    await fs.writeFile(dataFile, JSON.stringify(items, null, 2), "utf-8");

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Failed to save enquiry", error);
    return NextResponse.json(
      { error: "Unable to process your enquiry at the moment." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureDataFile();
    const raw = await fs.readFile(dataFile, "utf-8");
    return NextResponse.json(JSON.parse(raw || "[]"));
  } catch (error) {
    console.error("Failed to read enquiries", error);
    return NextResponse.json({ error: "Unable to fetch enquiries" }, { status: 500 });
  }
}

