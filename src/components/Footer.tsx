import KofiWidget from "./KofiWidget";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-gray-700 font-mono text-xs">
            NO MORE ARGUMENTS. JUST GAMES. | © {new Date().getFullYear()} SquadRoll.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 mt-4">
          <KofiWidget />
        </div>
      </div>
    </footer>
  )
}
