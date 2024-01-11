import { NextPage } from "next";
import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState<boolean>(true)
  const [isMiles, setIsMiles] = useState<boolean>(false)

  useEffect(() => {
    getUser().then((res) => {
      setLocation(res);
      let dist = Number(calcualteDistance(props.data, res).toFixed(2));
      if (isMiles) {
        dist *= 0.621371
      }
      setDistance(dist);
    }).finally(() => setLoading(false));

  }, []);

  async function getUser(): Promise<ISSData> {
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


  const roundToTwoDec = (num: number) => {
    return Number(num.toFixed(2))
  }

  const handleRadioChange = (event: any) => {
    // Update the state based on the selected value

    if (event.target.value === 'miles') {
      setIsMiles(true);
      setDistance(roundToTwoDec(distance * 0.621371))
    } else {
      setIsMiles(false);
      setDistance(roundToTwoDec(distance * 1.60934))
    }


  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('milkyway.jpeg')` }}>
      <div className="planet">
        <img src="iss-animation.jpg" alt="satelite" className="satelite" />
        <div className="earth">
        </div>
      </div>
      <div className="bg-black text-white mt-[400px] bg-opacity-50 p-4">
        {loading ? (

          <>Loading...</>

        ) : (
          <div >
            <div>
              User Coords- Lat- {location?.latitude} Long- {location?.longitude}
            </div>
            <div>
              ISS Coords- Lat- {props.data.latitude} Long- {props.data.longitude}
            </div>
            <div>

              {isMiles ? (

                <div>You are {distance} miles away from the Iss</div>
              ) : (

                <div>You are {distance} km away from the Iss</div>
              )}
              <form>
                <label>
                  <input
                    type="radio"
                    name="measurment"
                    value="miles"
                    checked={isMiles}
                    onChange={handleRadioChange}
                  />
                  Miles
                </label>

                <label>
                  <input
                    type="radio"
                    name="measurment"
                    value="kilometers"
                    checked={!isMiles}
                    onChange={handleRadioChange}
                  />
                  Kilometers
                </label>
              </form>


            </div>
          </div>
        )}
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

function calcualteDistance(iss: ISSData, user: ISSData) {
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
