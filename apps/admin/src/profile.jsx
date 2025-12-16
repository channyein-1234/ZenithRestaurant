import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function AdminLogoPage() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [navbarLogo, setNavbarLogo] = useState(null);

  // Load latest logo for navbar
  useEffect(() => {
    const loadLogo = async () => {
      const { data } = await supabase
        .from("logos")
        .select("logo_url")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setNavbarLogo(data.logo_url);
    };

    loadLogo();
  }, []);

  // Select file + preview
  const handleSelectFile = (e) => {
    const f = e.target.files[0];
    setFile(f);

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(f);
  };

  // Upload logo
  const handleUpload = async () => {
    if (!file) return alert("Please select an image first!");

    try {
      // Generate a unique file path
      const filePath = `logo-${Date.now()}-${file.name}`;

      // 1️⃣ Upload to Supabase storage with upsert
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      if (!uploadData) throw new Error("Upload failed: no data returned");

      // 2️⃣ Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      if (!publicUrl) throw new Error("Failed to get public URL");

      // 3️⃣ Insert into 'logos' table
      const { error: insertError } = await supabase
        .from("logos")
        .insert([{ logo_url: publicUrl }]);

      if (insertError) throw insertError;

      // 4️⃣ Success
      alert("Logo uploaded successfully!");
      setNavbarLogo(publicUrl);
      setFile(null);
      setLogoPreview(null);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload logo. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
{/* Navbar */}
<nav className="w-full bg-sky-300 p-4 shadow">
        <div className="flex flex-row flex-wrap items-center justify-between gap-2 sm:gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link to="/logo">
            <img
              src={navbarLogo || "/logo.svg"}
              alt="Logo"
              className="h-10 m-2 w-10 object-contain"
            />
            </Link>

            {/* Links */}
            <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 ">
              <Link
                to="/menu"
                className="font-bold ml-1 text-sm sm:text-sm sm:ml-2 md:text-lg lg:text-xl xl:text-xl 
                hover:text-gray-700 px-2 sm:px-3 md:px-5 lg:px-7"
              >
                Menu
              </Link>

              <Link
                to="/dashboard"
                className="font-bold text-sm sm:text-sm md:text-lg lg:text-xl xl:text-xl 
                hover:text-gray-700"
              >
                Dashboard
              </Link>
            </div>
          </div>

        </div>
      </nav>



      {/* Upload UI */}
      <div className="max-w-lg mx-auto p-6 mt-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Upload New Logo</h2>

        {/* Preview */}
        {logoPreview && (
          <div className="mb-4 flex justify-center">
            <img
              src={logoPreview}
              alt="Preview"
              className="w-32 h-32 object-contain border p-2 rounded"
            />
          </div>
        )}

        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleSelectFile}
          className="border p-2 rounded w-full mb-4"
        />

        {/* Upload button */}
        <button
          onClick={handleUpload}
          className="w-full bg-blue-400 text-white p-2 rounded hover:bg-blue-700"
        >
          Upload Logo
        </button>
      </div>
    </div>
  );
}
