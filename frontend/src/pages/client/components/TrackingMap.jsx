import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

export default function TrackingMap({
  clientCoords,
  workerCoords,
  workerName,
  status
}) {
  const isFinished = status === 'COMPLETED' || status === 'CANCELLED';

  return (
    <div className="w-full h-64 relative border-b border-slate-100 shadow-xs z-0">
      <MapContainer attributionControl className="w-full h-full" center={workerCoords} zoom={14} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Client Marker */}
        <Marker position={clientCoords}>
          <Popup><p className="text-xs font-bold">Lokasi Saya (Client)</p></Popup>
        </Marker>
        
        {/* Worker Marker */}
        {!isFinished && (
          <Marker position={workerCoords}>
            <Popup><p className="text-xs font-bold">Pekerja ({workerName})</p></Popup>
          </Marker>
        )}
        
        {/* Connection Line */}
        {!isFinished && (
          <Polyline positions={[clientCoords, workerCoords]} color="#046c7a" dashArray="5, 10" />
        )}
      </MapContainer>
    </div>
  );
}
