import { SignIn } from '@clerk/nextjs'
import { BackgroundBeams} from "@/components/ui/background-beams";

export default function Page() {
    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <BackgroundBeams />
            <SignIn/>
        </div>
    )
}