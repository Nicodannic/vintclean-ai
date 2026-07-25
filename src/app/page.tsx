import UploadBox from "./components/UploadBox";
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">

      <h1 className="text-5xl font-bold">
        VintClean AI
      </h1>

      <p className="mt-4 text-xl text-gray-600 text-center max-w-xl">
        Transforme tes photos Vinted en images professionnelles
        grâce à l'intelligence artificielle.
      </p>

      <UploadBox />

    </main>
  );
}