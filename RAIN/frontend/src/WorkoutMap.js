import { MapContainer, TileLayer, Polyline } from 'react-leaflet';

const WorkoutMap = ({ gps }) => {
  if (!gps || !gps.latitude || gps.latitude.length < 3) return null;//Določi kolko točk more bit minimalno

  const path = gps.latitude.map((lat, i) => [lat, gps.longitude[i]]);

  return (
    <div style={{ height: '300px', width: '100%', margin: '20px 0' }}>
      <MapContainer center={path[0]} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={path} color="blue" />
      </MapContainer>
    </div>
  );
};

export default WorkoutMap;
