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

    // Téléchargement de l'image originale
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Impossible de récupérer l'image");
    }

    const imageBuffer = await response.arrayBuffer();

    // Pour le moment on remet l'image telle quelle
    // (l'IA sera branchée ici ensuite)

    const fileName = `processed-${Date.now()}.webp`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("processed-images")
      .upload(fileName, imageBuffer, {
        contentType: "image/webp",
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabaseAdmin.storage
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