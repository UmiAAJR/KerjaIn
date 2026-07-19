import { useState } from 'react';
import TopNav from "../ui/TopNav";
import BottomNav from "../ui/BottomNav";
import { useLocation } from "../../context/LocationContext";
import MapPickerModal from "../ui/MapPickerModal";

const MobileLayout = ({
    children,
    topNavProps = {},
    bottomNavProps = {},
    showTopNav = true,
    showBottomNav = true,
}) => {
    const { location } = useLocation();
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Merge global location and click handler with the custom page props
    const mergedTopNavProps = {
        locationName: location.name,
        onLocationClick: () => setIsMapOpen(true),
        ...topNavProps,
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-8 px-0 sm:px-4">
            <div className="w-full sm:max-w-md h-screen sm:h-[850px] bg-slate-50 sm:shadow-2xl sm:border-[4px] sm:border-slate-800 flex flex-col overflow-hidden relative">

                <div className="hidden sm:flex justify-center items-center h-6 bg-slate-800 shrink-0" />

                {showTopNav && <TopNav {...mergedTopNavProps} />}

                <main className="grow overflow-y-auto pb-20">
                    {children}
                </main>

                {showBottomNav && <BottomNav {...bottomNavProps} />}

                {/* Map Picker Modal */}
                {isMapOpen && (
                    <MapPickerModal
                        isOpen={isMapOpen}
                        onClose={() => setIsMapOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default MobileLayout;