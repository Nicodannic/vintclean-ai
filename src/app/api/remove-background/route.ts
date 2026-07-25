import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image manquante" },
        { status: 400 }
      );
    }

    const image = await fetch(imageUrl);

    const imageBuffer = await image.arrayBuffer();

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/briaai/RMBG-1.4",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      }
    );

    const result = await response.text();

    console.log("HF RESPONSE:", response.status, result.slice(0,200));

    if (!response.ok) {
      return NextResponse.json(
        {
          error: result
        },
        {
          status: response.status
        }
      );
    }

    return NextResponse.json({
      message: "IA OK",
      result
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: String(error)
      },
      {
        status: 500
      }
    );
  }
}