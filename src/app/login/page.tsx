"use client"
export default function login(){
    return(
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div
                className="w-full max-w-sm mx-auto p-6 bg-black rounded-lg border border-gray-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.7)] transition-shadow duration-300"
            >
                <h1 className="text-2xl text-white text-center mb-6">Login / Sign Up</h1>

                <div className="flex space-x-4">
                    <button
                        className="flex-1 bg-black text-white border border-white rounded px-4 py-2 font-bold transition-colors duration-300 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    >
                        Log in
                    </button>
                </div>
            </div>
        </div>
    );
}