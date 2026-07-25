import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image manquante" },
        { status: 400 }
      );
    }

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Impossible de récupérer l'image");
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    const formData = new FormData();

    formData.append(
      "file",
      new Blob([imageBuffer], {
        type: "image/webp",
      }),
      "image.webp"
    );

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 180000); // 3 minutes

    const aiResponse = await fetch(
      "https://vintclean-ai-api.onrender.com/remove-background",
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();

      throw new Error(
        `Erreur Render ${aiResponse.status}: ${errorText}`
      );
    }

    const processedImage =
      await aiResponse.arrayBuffer();

    const fileName =
      `processed-${Date.now()}.png`;

    const { error } =
      await supabaseAdmin.storage
        .from("processed-images")
        .upload(
          fileName,
          processedImage,
          {
            contentType: "image/png",
          }
        );

    if (error) {
      throw error;
    }

    const { data } =
      supabaseAdmin.storage
        .from("processed-images")
        .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      processedImage: data.publicUrl,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}