import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        {
          error: "Aucune image reçue"
        },
        {
          status: 400
        }
      );
    }

    console.log("Image reçue :", imageUrl);

    return NextResponse.json({
      message: "Image reçue, IA prête à être connectée 🚀",
      imageUrl: imageUrl
    });

  } catch (error) {

    console.log("Erreur :", error);

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