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

    // Télécharger l'image originale
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Impossible de récupérer l'image");
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Envoyer l'image à notre IA Render
    const formData = new FormData();

    formData.append(
      "file",
      new Blob([imageBuffer]),
      "image.webp"
    );

    const aiResponse = await fetch(
      "https://vintclean-ai-api.onrender.com/remove-background",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!aiResponse.ok) {
      throw new Error("Erreur IA");
    }

    const processedBuffer = await aiResponse.arrayBuffer();

    // Upload résultat dans Supabase
    const fileName = `clean-${Date.now()}.png`;

    const { error } = await supabaseAdmin.storage
      .from("processed-images")
      .upload(
        fileName,
        processedBuffer,
        {
          contentType: "image/png",
        }
      );

    if (error) {
      throw error;
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
        error: String(error)
      },
      {
        status: 500
      }
    );
  }
}