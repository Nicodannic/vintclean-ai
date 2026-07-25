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

    console.log("Image reçue :", imageUrl);

    // Récupération de l'image depuis Supabase
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Impossible de récupérer l'image originale");
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    // Préparation du fichier pour l'IA Render
    const formData = new FormData();

    formData.append(
      "file",
      new Blob([imageBuffer], {
        type: "image/webp",
      }),
      "image.webp"
    );

    console.log("Envoi vers Render...");

    // Appel API IA
    const aiResponse = await fetch(
      "https://vintclean-ai-api.onrender.com/remove-background",
      {
        method: "POST",
        body: formData,
      }
    );

    console.log(
      "Réponse Render :",
      aiResponse.status
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();

      throw new Error(
        `Render erreur ${aiResponse.status}: ${errorText}`
      );
    }

    const processedImage =
      await aiResponse.arrayBuffer();


    // Upload dans Supabase
    const fileName =
      `processed-${Date.now()}.png`;

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from("processed-images")
        .upload(
          fileName,
          processedImage,
          {
            contentType: "image/png",
            upsert: false,
          }
        );


    if (uploadError) {
      throw uploadError;
    }


    const { data } =
      supabaseAdmin.storage
        .from("processed-images")
        .getPublicUrl(fileName);


    console.log(
      "Image finale :",
      data.publicUrl
    );


    return NextResponse.json({
      success: true,
      processedImage: data.publicUrl,
    });


  } catch (error) {

    console.error(
      "ERREUR COMPLETE :",
      error
    );

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