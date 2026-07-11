declare namespace Api {
  namespace Home {
    interface StatisticItem {
      total_num?: number;
    }

    interface StatisticResponse {
      corp_stat?: StatisticItem;
      project_stat?: StatisticItem;
      project_ad_stat?: StatisticItem;
      user_stat?: StatisticItem;
    }

    interface WeatherCoordinates {
      latitude: number;
      longitude: number;
    }

    interface WeatherParams {
      coordinates: WeatherCoordinates;
      weather_way: number;
    }

    interface Weather {
      date: string;
      weather: string;
      min_temperature: string;
      max_temperature: string;
      wind_direction: string;
      wind_speed: string;
    }

    interface WeatherResponse {
      weather: Weather;
    }
  }
}
