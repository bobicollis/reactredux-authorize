import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import authService from '../components/api-authorization/AuthorizeService'

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface WeatherForecastsState {
    isLoading: boolean;
    startDateIndex?: number;
    forecasts: WeatherForecast[];
}

export interface WeatherForecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

enum WeatherForecastActionTypes {
    requestWeatherForecasts = 'REQUEST_WEATHER_FORECASTS',
    receiveWeatherForecasts = 'RECEIVE_WEATHER_FORECASTS'
}

interface RequestWeatherForecastsAction {
    type: WeatherForecastActionTypes.requestWeatherForecasts // 'REQUEST_WEATHER_FORECASTS';
    startDateIndex: number;
}

interface ReceiveWeatherForecastsAction {
    type: WeatherForecastActionTypes.receiveWeatherForecasts // 'RECEIVE_WEATHER_FORECASTS';
    startDateIndex: number;
    forecasts: WeatherForecast[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestWeatherForecastsAction | ReceiveWeatherForecastsAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestWeatherForecasts: (startDateIndex: number): AppThunkAction<KnownAction> => async (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();
        if (appState && appState.weatherForecasts && startDateIndex !== appState.weatherForecasts.startDateIndex) {
            dispatch({ type: WeatherForecastActionTypes.requestWeatherForecasts, startDateIndex: startDateIndex });

            const token = await authService.getAccessToken();
            const response = await fetch('weatherforecast', {
               headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            dispatch({ type: WeatherForecastActionTypes.receiveWeatherForecasts, startDateIndex: startDateIndex, forecasts: data });
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: WeatherForecastsState = { forecasts: [], isLoading: false };

export const reducer: Reducer<WeatherForecastsState> = (state: WeatherForecastsState | undefined, incomingAction: Action): WeatherForecastsState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case WeatherForecastActionTypes.requestWeatherForecasts:
            return {
                startDateIndex: action.startDateIndex,
                forecasts: state.forecasts,
                isLoading: true
            };
        case WeatherForecastActionTypes.receiveWeatherForecasts:
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            if (action.startDateIndex === state.startDateIndex) {
                return {
                    startDateIndex: action.startDateIndex,
                    forecasts: action.forecasts,
                    isLoading: false
                };
            }
            break;
    }

    return state;
};
