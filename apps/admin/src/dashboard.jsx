import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [img, setImg] = useState(null);
  const [navbarLogo, setNavbarLogo] = useState(null);

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

const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!img) {
        alert("Please select an image before uploading!");
        return;
      }
        
      try {
        // 1 Upload
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("menu-image")
          .upload(`images/${Date.now()}-${img.name}`, img);
      
        if (uploadError) {
          console.error("Upload Error:", uploadError);
          throw uploadError;
        }
      
        if (!uploadData) throw new Error("Upload data is null");
      
        // 2 Get public URL
        const { data, error } = supabase
            .storage
            .from("menu-image")
            .getPublicUrl(uploadData.path);

        if (error) throw error;

        const publicUrl = data.publicUrl;

        console.log("Public URL:", publicUrl);

      
        // 3 Insert into table
        const { error: insertError } = await supabase
          .from("menu")
          .insert([{ name, price, image: publicUrl }]);
      
        if (insertError) {
          console.error("Insert Error:", insertError);
          throw insertError;
        }
      
        alert("Menu item uploaded successfully!");
        setName("");
        setImg(null);
      } catch (error) {
        console.error("Final Error:", error);
        alert("Failed to upload menu item. Check console for details.");
      }
      
  };

  return (
    <div className="min-h-screen bg-sky-100">
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


      {/* Form */}
      <div className="max-w-md w-full mx-auto mt-6 sm:mt-8 md:mt-10 bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 text-sky-600">
          Upload Menu
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Menu Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 sm:p-3 md:p-4 rounded focus:outline-sky-400 text-sm sm:text-base md:text-lg"
            required
          />
          <input
            type="text"
            placeholder="Menu Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 sm:p-3 md:p-4 rounded focus:outline-sky-400 text-sm sm:text-base md:text-lg"
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImg(e.target.files[0])}
            className="border p-2 sm:p-3 md:p-4 rounded focus:outline-sky-400 text-sm sm:text-base md:text-lg"
            required
          />

          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold p-2 sm:p-3 md:p-4 rounded text-sm sm:text-base md:text-lg"
          >
            Upload
          </button>
        </form>
      </div>

    </div>
  );
}


