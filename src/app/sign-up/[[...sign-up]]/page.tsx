import { SignUp } from '@clerk/nextjs'
import { BackgroundBeams } from "@/components/ui/background-beams"

export default function Page() {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
            <BackgroundBeams className="opacity-30" />
            <div className="relative z-10 p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
                <SignUp appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-transparent shadow-none",
                        headerTitle: "text-white text-2xl",
                        headerSubtitle: "text-white/70",
                        formButtonPrimary: "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-medium transition-all duration-200",
                        formFieldLabel: "text-white/80",
                        formFieldInput: "bg-black/30 border-white/10 text-white focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20",
                        footerActionLink: "text-teal-400 hover:text-teal-300",
                        identityPreviewEditButton: "text-teal-400 hover:text-teal-300",
                        formResendCodeLink: "text-teal-400 hover:text-teal-300",
                    }
                }} />
            </div>
        </div>
    )
}
