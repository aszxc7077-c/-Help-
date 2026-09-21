import { useCallback, useEffect, useMemo, useState } from "react";

type Place = { name: string; country: string; latitude: number; longitude: number; timezone: string };
type Weather = {
  current: { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; wind_speed_10m: number; weather_code: number; is_day: number };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[] };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] };
};

const weatherLabels: Record<number, [string, string]> = {
  0: ["Clear sky", "☀️"], 1: ["Mainly clear", "🌤️"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁️"],
  45: ["Foggy", "🌫️"], 48: ["Rime fog", "🌫️"], 51: ["Light drizzle", "🌦️"], 53: ["Drizzle", "🌦️"], 55: ["Heavy drizzle", "🌧️"],
  61: ["Light rain", "🌦️"], 63: ["Rain", "🌧️"], 65: ["Heavy rain", "🌧️"], 71: ["Light snow", "🌨️"], 73: ["Snow", "❄️"], 75: ["Heavy snow", "❄️"],
  80: ["Rain showers", "🌦️"], 81: ["Showers", "🌧️"], 82: ["Heavy showers", "⛈️"], 95: ["Thunderstorm", "⛈️"], 96: ["Hail storm", "⛈️"], 99: ["Hail storm", "⛈️"],
};
const labelFor = (code: number) => weatherLabels[code] ?? ["Unknown", "🌡️"];
const dayName = (date: string, index: number) => index === 0 ? "Today" : new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(`${date}T12:00:00`));

export default function WeatherDashboard() {
  const [place, setPlace] = useState<Place>({ name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London" });
  const [weather, setWeather] = useState<Weather | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [unit, setUnit] = useState<"celsius" | "fahrenheit">("celsius");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWeather = useCallback(async (nextPlace: Place) => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ latitude: String(nextPlace.latitude), longitude: String(nextPlace.longitude), current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day", hourly: "temperature_2m,weather_code", daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max", forecast_days: "7", timezone: "auto" });
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!response.ok) throw new Error("Weather service is unavailable");
      setWeather(await response.json());
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load weather"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadWeather(place); }, [loadWeather, place]);
  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`, { signal: controller.signal });
        const data = await response.json();
        setSuggestions((data.results ?? []).map((item: Place) => ({ name: item.name, country: item.country, latitude: item.latitude, longitude: item.longitude, timezone: item.timezone })));
      } catch { /* Ignore cancelled searches. */ }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [query]);

  const temperature = (value: number) => unit === "celsius" ? Math.round(value) : Math.round(value * 9 / 5 + 32);
  const wind = (value: number) => unit === "celsius" ? `${Math.round(value)} km/h` : `${Math.round(value * 0.621371)} mph`;
  const hourly = useMemo(() => weather?.hourly.time.map((time, index) => ({ time, temp: weather.hourly.temperature_2m[index], code: weather.hourly.weather_code[index] })).filter((item) => new Date(item.time) >= new Date()).slice(0, 8) ?? [], [weather]);
  const useCurrentLocation = () => navigator.geolocation?.getCurrentPosition(async ({ coords }) => { setPlace({ name: "Current location", country: "", latitude: coords.latitude, longitude: coords.longitude, timezone: "auto" }); }, () => setError("Location permission was not granted."));

  return <main className="weather-app">
    <header className="weather-header"><div><p className="eyebrow">WEATHER / LIVE FORECAST</p><h1>Skycast</h1></div><div className="header-actions"><button className="location-button" onClick={useCurrentLocation}>⌖ Use my location</button><button className="unit-toggle" onClick={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")}>°{unit === "celsius" ? "C" : "F"}</button></div></header>
    <section className="search-wrap"><form onSubmit={(event) => { event.preventDefault(); if (suggestions[0]) { setPlace(suggestions[0]); setQuery(""); setSuggestions([]); } }}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for a city..." aria-label="Search for a city" /></form>{suggestions.length > 0 && <div className="suggestions">{suggestions.map((item) => <button key={`${item.latitude}-${item.longitude}`} onClick={() => { setPlace(item); setQuery(""); setSuggestions([]); }}>{item.name}, {item.country}</button>)}</div>}</section>
    {error && <div className="error-banner">{error} <button onClick={() => void loadWeather(place)}>Try again</button></div>}
    {loading && <div className="loading-card">Loading your forecast…</div>}
    {!loading && weather && <>
      <section className="overview-card"><div><p className="location-label">CURRENT WEATHER</p><h2>{place.name}{place.country && <small>{place.country}</small>}</h2><p className="updated">Updated just now · {weather.timezone}</p></div><div className="current-weather"><span className="weather-icon">{labelFor(weather.current.weather_code)[1]}</span><div><strong>{temperature(weather.current.temperature_2m)}°</strong><p>{labelFor(weather.current.weather_code)[0]}</p></div></div><div className="weather-details"><div><span>Feels like</span><b>{temperature(weather.current.apparent_temperature)}°</b></div><div><span>Humidity</span><b>{weather.current.relative_humidity_2m}%</b></div><div><span>Wind</span><b>{wind(weather.current.wind_speed_10m)}</b></div></div></section>
      <section className="content-grid"><div className="panel"><div className="panel-heading"><div><p className="eyebrow">NEXT 24 HOURS</p><h3>Hourly forecast</h3></div><span className="muted">Local time</span></div><div className="hourly-list">{hourly.map((item) => <div className="hour" key={item.time}><span>{new Date(item.time).toLocaleTimeString([], { hour: "numeric" })}</span><i>{labelFor(item.code)[1]}</i><b>{temperature(item.temp)}°</b></div>)}</div></div><div className="panel highlights"><div className="panel-heading"><div><p className="eyebrow">AT A GLANCE</p><h3>Today’s highlights</h3></div></div><div className="highlight-grid"><div><span>☂</span><p>Rain chance</p><b>{weather.daily.precipitation_probability_max[0]}%</b></div><div><span>↗</span><p>Daylight</p><b>{weather.current.is_day ? "Daytime" : "Night"}</b></div></div></div></section>
      <section className="panel weekly"><div className="panel-heading"><div><p className="eyebrow">PLAN AHEAD</p><h3>7-day forecast</h3></div></div><div className="week-list">{weather.daily.time.map((date, index) => <div className="day" key={date}><strong>{dayName(date, index)}</strong><span>{labelFor(weather.daily.weather_code[index])[1]}</span><div><b>{temperature(weather.daily.temperature_2m_max[index])}°</b><em>{temperature(weather.daily.temperature_2m_min[index])}°</em></div><small>{weather.daily.precipitation_probability_max[index]}% rain</small></div>)}</div></section>
    </>}
    <footer>Data provided by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · No API key required</footer>
  </main>;
}
