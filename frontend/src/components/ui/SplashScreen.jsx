import { useEffect, useState } from "react"
import logo from '../../assets/Logo.png'

const SplashScreen = ({ onFinish }) => {
    const [progress, setProgress] = useState(0)
    const [isFadingOut, setIsFadingOut] = useState(false)

    useEffect(() => {
        const intervalTime = 30
        const totalDuration = 2000
        const step = 100 / (totalDuration / intervalTime)

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer)
                    return 100
                }
                return prev + step
            })
        }, intervalTime);

        const fadeOutTimeout = setTimeout(() => {
            setIsFadingOut(true)
        }, 2000);

        const finishTimeout = setTimeout(() => {
            onFinish()
        }, 2500);

        return () => {
            clearInterval(timer)
            clearTimeout(fadeOutTimeout)
            clearTimeout(finishTimeout)
        }
    }, [onFinish])

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ease-out ${isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
        >
            {/* Ambient Background */}
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-secondary-500/10 blur-[140px] animate-pulse" />

            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary-500/10 blur-[140px] animate-pulse" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo */}
                <img
                    src={logo}
                    alt="KerjaIn"
                    className="mb-12 h-56 w-56 object-contain drop-shadow-2xl"
                    style={{
                        animation: "float 2.8s ease-in-out infinite",
                    }}
                />

                <p className="mb-12 text-xs text-center font-semibold uppercase tracking-[0.35em] text-gray-500">
                    Connecting Local Workers with Trusted Opportunities
                </p>

                {/* Progress */}
                <div className="flex flex-col items-center gap-3">
                    <div className="h-2 w-56 overflow-hidden rounded-full bg-gray-300">
                        <div
                            className="h-full rounded-full bg-secondary-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <span className="text-xs font-medium tracking-widest text-gray-500">
                        {Math.min(100, Math.round(progress))}%
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gray-400">
                    Secure • Reliable • Fair
                </p>
            </div>

            <style>
                {`
                    @keyframes float {
                        0%,100%{
                        transform: translateY(0px);
                        }
                        50%{
                        transform: translateY(-10px);
                        }
                    }
                `}
    </style>
        </div>
    );
}

export default SplashScreen