/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./client/*.{js,html}", "./client/components/*.{hs,html}"],
  theme: {
    extend: {
      backgroundImage: {
        cursor: "url('/cursor.png')",
        pointer: "url('/pointer.png')",
        folder: "url('/folder.png')",
      },
    },
  },
  plugins: [],
}
