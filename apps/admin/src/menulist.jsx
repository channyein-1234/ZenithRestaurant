import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

export default function MenuList() {
  const [items, setItems] = useState([]);
  const [navbarLogo, setNavbarLogo] = useState(null);

  // Fetch items from Supabase on component mount
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

    const fetchItems = async () => {
      const { data, error } = await supabase
        .from("menu")
        .select("id, created_at, name, price, image");

      if (error) {
        console.error("Error fetching menu items:", error);
      } else {
        setItems(data);
      }
    };

    fetchItems();
  }, []);

  // Delete item both locally and in Supabase
  const handleDelete = async (idToRemove) => {
    // Delete from Supabase
    const { error } = await supabase
      .from("menu")
      .delete()
      .eq("id", idToRemove);

    if (error) {
      console.error("Error deleting item:", error);
      return;
    }
    // Remove locally
    setItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  return (
    <div className="menu">
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



      {/* Menu Grid */}
      <div className="menulist grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {items.length === 0 ? (
          <p>No menu items yet.</p>
        ) : (
          [...items]
            .sort((a, b) => b.rating - a.rating)
            .map((item) => (
              <div key={item.id}   className="menu-item p-4 bg-gray-100 rounded border border-gray-300"
>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded"
                />
                <p className="font-bold mt-2">{item.name}</p>
                <p>Price: {item.price} Kyats</p>

                <button
                  className="bg-red-500 text-white px-3 py-1 mt-2 rounded w-full"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
