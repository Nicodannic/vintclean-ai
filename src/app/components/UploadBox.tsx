"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadBox() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (error) {
      console.log("ERREUR SUPABASE :", error);
      alert(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    setImage(data.publicUrl);

    setUploading(false);
  }


  async function cleanImage() {
    setCleaning(true);

    const response = await fetch("/api/remove-background", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: image,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    alert(JSON.stringify(data));

    setCleaning(false);
  }


  return (
    <div className="mt-10 flex flex-col items-center">

      <label className="flex h-64 w-96 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50">

        {uploading ? (
          <p>Envoi en cours...</p>
        ) : (
          <>
            <p className="text-lg font-medium">
              📷 Dépose ta photo ici
            </p>

            <p className="mt-2 text-sm text-gray-500">
              ou clique pour choisir
            </p>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

      </label>


      {image && (
        <div className="mt-8 flex flex-col items-center">

          <p className="mb-4 text-green-600 font-medium">
            Image envoyée ✅
          </p>

          <img
            src={image}
            alt="Image uploadée"
            className="h-72 rounded-xl shadow-lg"
          />


          <button
            onClick={cleanImage}
            disabled={cleaning}
            className="mt-6 rounded-xl bg-black px-6 py-3 text-white"
          >
            {cleaning
              ? "Nettoyage en cours..."
              : "Nettoyer la photo ✨"}
          </button>


        </div>
      )}

    </div>
  );
}