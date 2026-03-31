import Sidebar from "@/components/sidebar"
export default function Homepage() {
  return (
    <div className="w-64 h-screen sticky top-0 bg-black text-white flex flex-col justify-between p-6">
      <Sidebar />
    </div>
  )
}