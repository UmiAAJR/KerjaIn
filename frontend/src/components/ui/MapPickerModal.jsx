import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useLocation } from '../../context/LocationContext';
import { MapPin, SearchIcon, Compass } from 'lucide-react';

const MapPickerModal = ({ isOpen, onClose }) => {
  const { location, updateLocation } = useLocation();
  const mapRef = useRef(null);
  const activeMapRef = useRef(null);

  // Temporary location states inside the modal initialized with current context
  const [tempCoords, setTempCoords] = useState({ lat: location.lat, lng: location.lng });
  const [tempAddress, setTempAddress] = useState(location.name);
  
  // Interactive UI states
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Reverse geocoding helper
  const reverseGeocode = async (lat, lng) => {
    setIsLoadingAddress(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id,en`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        
        // Parse a clean, concise address (e.g. "Street Name, City")
        const place = addr.mall || addr.amenity || addr.tourism || addr.historic || addr.building || addr.shop || addr.office || addr.hotel || addr.leisure || '';
        const street = addr.road || addr.street || addr.highway || '';
        const suburb = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || '';
        const city = addr.city || addr.town || addr.city_district || addr.municipality || '';
        
        let line1 = '';
        if (place) {
          line1 = place;
        } else if (street) {
          line1 = street;
        } else if (suburb) {
          line1 = suburb;
        }
        
        let line2 = city;
        
        let name = '';
        if (line1 && line2) {
          name = `${line1}, ${line2}`;
        } else if (line1) {
          name = line1;
        } else if (line2) {
          name = line2;
        } else {
          name = data.display_name ? data.display_name.split(',').slice(0, 2).join(',') : 'Lokasi Kustom';
        }
        
        setTempAddress(name);
      } else {
        setTempAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setTempAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Debounce ref for reverse geocoding to avoid API spam
  const geocodeTimeoutRef = useRef(null);

  const debouncedReverseGeocode = (lat, lng) => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }
    geocodeTimeoutRef.current = setTimeout(() => {
      reverseGeocode(lat, lng);
    }, 400);
  };

  // Address search helper
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=id,en`);
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results.map(item => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        })));
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Suggestion click helper
  const handleSelectSuggestion = (item) => {
    setSearchResults([]);
    setSearchQuery(item.display_name.split(',').slice(0, 3).join(','));
    setTempCoords({ lat: item.lat, lng: item.lon });
    setTempAddress(item.display_name.split(',').slice(0, 2).join(','));
    
    if (activeMapRef.current) {
      activeMapRef.current.setView([item.lat, item.lon], 16);
    }
  };

  // Geolocation trigger
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung deteksi lokasi GPS.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setTempCoords({ lat: latitude, lng: longitude });
        if (activeMapRef.current) {
          activeMapRef.current.setView([latitude, longitude], 16);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Gagal mendapatkan lokasi saat ini. Pastikan izin GPS aktif.");
      }
    );
  };

  // Map initialization inside Modal (runs once when modal opens and component mounts)
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    // Small delay to ensure Modal animation finishes and DOM is stable
    const timer = setTimeout(() => {
      const L = window.L;
      if (!L) {
        console.error("Leaflet (L) is not loaded on window.");
        return;
      }

      const mapInstance = L.map(mapRef.current, {
        center: [tempCoords.lat, tempCoords.lng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Event handlers
      mapInstance.on('movestart', () => {
        setIsDragging(true);
      });

      mapInstance.on('move', () => {
        const center = mapInstance.getCenter();
        setTempCoords({ lat: center.lat, lng: center.lng });
      });

      mapInstance.on('moveend', () => {
        setIsDragging(false);
        const center = mapInstance.getCenter();
        debouncedReverseGeocode(center.lat, center.lng);
      });

      activeMapRef.current = mapInstance;
    }, 200);

    return () => {
      clearTimeout(timer);
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
      if (activeMapRef.current) {
        activeMapRef.current.off();
        activeMapRef.current.remove();
        activeMapRef.current = null;
      }
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle confirming selected location
  const handleConfirm = () => {
    updateLocation(tempCoords.lat, tempCoords.lng, tempAddress);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Lokasi Layanan"
      className="sm:max-w-md"
    >
      <div className="space-y-4 flex flex-col h-full max-h-[70vh]">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative z-10">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Cari jalan, gedung, atau area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-[#046c7a] transition-all"
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <SearchIcon size={14} className="stroke-[2.5]" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-[#046c7a] hover:bg-[#035f6b] text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSearching ? 'Cari...' : 'Cari'}
            </button>
          </div>

          {/* Search suggestions overlay */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-[500] max-h-[160px] overflow-y-auto divide-y divide-slate-50">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors text-[11px] font-medium text-slate-700 block truncate"
                >
                  {item.display_name}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Map Container */}
        <div className="relative w-full h-[230px] rounded-2xl overflow-hidden border border-slate-100 shadow-inner z-0 bg-slate-50">
          {/* Leaflet Mount Element */}
          <div ref={mapRef} className="w-full h-full" />

          {/* Custom Center Pin with smooth Lift/Drop animations and scaling shadow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-[400] flex flex-col items-center">
            <div className={`transition-transform duration-200 ease-out ${isDragging ? '-translate-y-2.5' : ''}`}>
              <svg className="w-9 h-9 text-[#046c7a] drop-shadow-[0_4px_5px_rgba(0,0,0,0.3)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <div className={`w-3.5 h-1.5 bg-slate-950/20 rounded-full blur-[1px] transition-all duration-200 ${isDragging ? 'scale-50 opacity-40' : 'scale-100 opacity-100'}`} />
          </div>

          {/* GPS Current Geolocation Floating Button */}
          <button
            type="button"
            onClick={handleCurrentLocation}
            className="absolute bottom-3 right-3 p-2.5 bg-white text-[#046c7a] hover:bg-slate-50 border border-slate-100 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all z-[400]"
          >
            <Compass size={18} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Selected Location Address Details */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start select-none">
          <div className="w-8 h-8 rounded-lg bg-[#eef8f9] flex items-center justify-center text-[#046c7a] shrink-0 mt-0.5">
            <MapPin size={16} className="stroke-2" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Lokasi Terpilih
            </span>
            <div className="min-h-[1.5rem] flex items-center">
              {isLoadingAddress ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <div className="w-3 h-3 border-2 border-[#046c7a] border-t-transparent rounded-full animate-spin" />
                  <span>Mencari alamat...</span>
                </div>
              ) : (
                <span className="block text-xs font-extrabold text-slate-700 truncate">
                  {tempAddress}
                </span>
              )}
            </div>
            <span className="block text-[10px] font-semibold text-slate-400/90 font-mono">
              {tempCoords.lat.toFixed(5)}, {tempCoords.lng.toFixed(5)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleConfirm}
          disabled={isLoadingAddress}
          className="w-full bg-[#046c7a] hover:bg-[#035f6b] text-white rounded-xl py-3 text-xs font-extrabold shadow-lg shadow-[#046c7a]/10"
        >
          Konfirmasi Lokasi Ini
        </Button>
      </div>
    </Modal>
  );
};

export default MapPickerModal;
