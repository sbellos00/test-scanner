import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <div className="flex flex-col items-center justify-center gap-8 text-center">
        <Image
          src="/EtsiEinaiHFash.png"
          alt="Utopia Logo"
          width={320}
          height={200}
          priority
        />
        
        <div className="flex gap-4">
          <a 
            href="/scanner" 
            className="px-8 py-2 text-4xl bg-[#a701b8] rounded-lg hover:bg-[#8a0198] transition-colors duration-300 font-['Times_New_Roman',serif]"
          >
            enter
          </a>
          
          <a 
            href="/tv-beta" 
            className="px-8 py-2 text-4xl bg-[#a701b8] rounded-lg hover:bg-[#8a0198] transition-colors duration-300 font-['Times_New_Roman',serif]"
          >
            tv-beta
          </a>
        </div>
        
        <div className="w-full flex justify-between mt-12">
          <div className="text-sm">HyperSpace Labs</div>
          <div className="text-sm">Experiment #0</div>
        </div>
      </div>
    </div>
  );
}
