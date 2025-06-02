import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { duration: 0.75 });
    }
  }, [center]);

  return null;
};

const blackDotIcon = new L.DivIcon({
  className: 'custom-marker',
  html: '<div style="width:10px; height:10px; background-color:black; border-radius:50%;"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const WorkoutMap = ({ gps }) => {
  if (!gps || !gps.latitude || gps.latitude.length < 3) return null;

  const points = gps.latitude.map((lat, i) => ({
    position: [lat, gps.longitude[i]],
    altitude: gps.altitude?.[i] ?? 'N/A',
  }));

  const path = points.map(p => p.position);

  return (
    <div style={{ height: '300px', width: '100%', margin: '20px 0' }}>
      <MapContainer center={path[0]} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <RecenterMap center={path[0]} />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={path} color="blue" />
        {points.map((point, idx) => (
          <Marker key={idx} position={point.position} icon={blackDotIcon}>
            <Popup>
              <div>
                <div><strong>Latitude:</strong> {point.position[0]}</div>
                <div><strong>Longitude:</strong> {point.position[1]}</div>
                <div><strong>Altitude:</strong> {point.altitude}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorkoutMap;