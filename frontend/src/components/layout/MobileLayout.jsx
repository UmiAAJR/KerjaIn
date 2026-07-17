import React from "react";

const MobileLayout = ({ children, title }) => {
    return (
        <>
            <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-8 px-0 sm:px-4">
                {/* Simulated iPhone/Android Device Container */}
                <div className="w-full sm:max-w-md h-screen sm:h-[850px] bg-slate-50 sm:shadow-2xl sm:border-[4px] sm:border-slate-800 flex flex-col overflow-hidden relative">

                    {/* Device Top Speaker and Camera Notch for desktop preview */}
                    <div className="hidden sm:flex justify-center items-center h-6 bg-slate-800 shrink-0">
                    </div>

                    {/* App Topbar */}
                    <header className="bg-red-300 h-15 border-b border-slate-100 px-5 py-4 flex items-center justify-between shrink-0">

                    </header>

                    {/* Main Content Area */}
                    <main className="grow overflow-y-auto pb-20 bg-amber-100">
                        {children}
                    </main>

                    {/* Bottom Tabbar */}
                    <nav className="absolute h-15 bottom-0 left-0 right-0 bg-red-300 border-t border-slate-100 px-4 py-2 flex justify-around items-center z-10 shrink-0">

                    </nav>
                </div>
            </div>
        </>
    )
}

export default MobileLayout