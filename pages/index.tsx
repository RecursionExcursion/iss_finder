import { NextPage } from "next";
import { useEffect, useState } from "react";
import backgroundImage from '../public/iss.jpg';

interface ISSData {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
  footprint: number;
  timestamp: number;
  daynum: number;
  solar_lat: number;
  solar_lon: number;
  units: string;
}

const Home: NextPage<any> = (props) => {
  const [location, setLocation] = useState<ISSData>();
  const [distance, setDistance] = useState<number>(0);

  useEffect(() => {
    getUser().then((res) => {
      setLocation(res);
      const dist = startMathin(props.data, res).toFixed(2);
      setDistance(Number(dist));
    });
  }, []);

  function getUser(): Promise<ISSData> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const coords: ISSData = {
              name: "user",
              id: -1,
              latitude: latitude,
              longitude: longitude,
              altitude: 0,
              velocity: 0,
              visibility: "string",
              footprint: -1,
              timestamp: -1,
              daynum: -1,
              solar_lat: -1,
              solar_lon: -1,
              units: "kilometers",
            };

            resolve(coords);
          },
          (error) => {
            console.error(`Error getting location: ${error.message}`);
            reject(error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  }

  return (
    <main class="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('iss.jpg')` }}>
      <div class="bg-gray-200 opacity-80 ">
        <div>
          User Coords- Lat- {location?.latitude} Long- {location?.longitude}
        </div>
        <div>
          ISS Coords- Lat- {props.data.latitude} Long- {props.data.longitude}
        </div>

        <div>You are {distance} km away from the Iss</div>
      </div>
    </main>
  );
};

export const getServerSideProps = async () => {
  const response = await fetch(
    "https://api.wheretheiss.at/v1/satellites/25544"
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const issLocation = await response.json();

  return {
    props: {
      data: issLocation,
    },
  };
};

function startMathin(iss: ISSData, user: ISSData) {
  //haversine formula

  const earthRadius = 6371; // km

  const lat1 = (iss.latitude * Math.PI) / 180;
  const lat2 = (user.latitude * Math.PI) / 180;

  const deltaLat = user.latitude - (iss.latitude * Math.PI) / 180;
  const deltaLong = ((user.longitude - iss.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLong / 2) *
      Math.sin(deltaLong / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = earthRadius * c;

  //pythagoras theorem

  const hypotenuseSqrd = iss.altitude * iss.altitude + d * d;
  const hypotenuse = Math.sqrt(hypotenuseSqrd);

  return hypotenuse;
}

export default Home;
