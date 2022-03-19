import { createStore } from "redux"
import reduxDevToolsSetting from "./reduxDevToolsSetting"

class ReduxHandler {

    ADD_ACTION_TYPE = "ADD_ACTION_TYPE"
    SET_ACTION_TYPE = "SET_ACTION_TYPE"
    AREA_COLLECTION = "AREA_COLLECTION"
    CITY_COLLECTION = "CITY_COLLECTION"
    SHELTERS_IN_CITY_COLLECTION = "SHELTERS_IN_CITY_COLLECTION"
    SHELTER_DETAIL_COLLECTION = "SHELTER_DETAIL_COLLECTION"
    SPECIES_COLLECTION = "SPECIES_COLLECTION"

    BOUNDARY_PATH_COLLECTION = "BOUNDARY_PATH_COLLECTION"

    static NON_EXIST = "NON_EXIST"

    static defaultStore = {
        areas: [],
        citiesInAreaMap: new Map(),
        sheltersInCityMap: new Map(),
        shelterDetailMap: new WeakMap(),
        speciesMap: new Map(),
        boundaryPathMap: new Map()
    }

    constructor() {
        // this.store = createStore(this.setStore.bind(this), reduxDevToolsSetting())
        this.store = createStore(this.setStore.bind(this))
    }

    subscribe(callback) {
        this.store.subscribe(() => {
            const data = this.store.getState()
            callback(data)
        })
    }

    setStore(state = ReduxHandler.defaultStore, action) {
        if (action.collection === null || action.collection === undefined) {
            return state
        }
        switch (action.collection) {
            case this.AREA_COLLECTION:
                if (action.type === this.SET_ACTION_TYPE) {
                    return {
                        ...state,
                        areas: action.areas
                    }
                }
            case this.CITY_COLLECTION:
                if (action.type === this.ADD_ACTION_TYPE) {
                    const citiesInAreaMap = new Map(state.citiesInAreaMap)
                    citiesInAreaMap.set(action.area, action.cities)
                    return {
                        ...state,
                        citiesInAreaMap: citiesInAreaMap
                    }
                }
            case this.SHELTERS_IN_CITY_COLLECTION:
                if (action.type === this.SET_ACTION_TYPE) {
                    const sheltersInCityMap = new Map(state.sheltersInCityMap)
                    sheltersInCityMap.set(action.city, action.shelters)
                    return {
                        ...state,
                        sheltersInCityMap: sheltersInCityMap
                    }
                }
            case this.SHELTER_DETAIL_COLLECTION:
                if (action.type === this.SET_ACTION_TYPE) {
                    const shelterDetailMap = state.shelterDetailMap
                    shelterDetailMap.set(action.shelter, action.shelterDetail)
                    return {
                        ...state,
                        shelterDetailMap: shelterDetailMap
                    }
                }
            case this.SPECIES_COLLECTION:
                if (action.type === this.SET_ACTION_TYPE) {
                    const speciesMap = new Map(state.speciesMap)
                    speciesMap.set(action.family, action.species)
                    return {
                        ...state,
                        speciesMap: speciesMap
                    }
                }
            case this.BOUNDARY_PATH_COLLECTION:
                if (action.type === this.SET_ACTION_TYPE) {
                    const boundaryPathMap = new Map(state.boundaryPathMap)
                    boundaryPathMap.set(action.address, action.path)
                    return {
                        ...state,
                        boundaryPathMap: boundaryPathMap
                    }
                }
        }
        console.assert(false, "Attempt to use not impletemented action", action)
        return state
    }

    getAreas() {
        return this.store.getState().areas
    }

    setAreas(areas) {
        this.store.dispatch({
            type: this.SET_ACTION_TYPE,
            collection: this.AREA_COLLECTION,
            areas: areas
        })
    }

    getCitiesIn(area) {
        const citiesInAreaMap = this.store.getState().citiesInAreaMap
        if (citiesInAreaMap.has(area)) {
            return citiesInAreaMap.get(area)
        } else {
            return ReduxHandler.NON_EXIST
        }
    }

    addCitiesIn(area, cities) {
        this.store.dispatch({
            type: this.ADD_ACTION_TYPE,
            collection: this.CITY_COLLECTION,
            area: area,
            cities: cities
        })
    }

    getSheltersIn(city) {
        const sheltersInCityMap = this.store.getState().sheltersInCityMap
        if (sheltersInCityMap.has(city)) {
            return sheltersInCityMap.get(city)
        } else {
            return ReduxHandler.NON_EXIST
        }
    }

    setSheltersIn(city, shelters) {
        this.store.dispatch({
            type: this.SET_ACTION_TYPE,
            collection: this.SHELTERS_IN_CITY_COLLECTION,
            city: city,
            shelters: shelters
        })
    }

    getShelterDetailOf(shelter) {
        const shelterDetailMap = this.store.getState().shelterDetailMap
        if(shelterDetailMap.has(shelter)) {
            return shelterDetailMap.get(shelter)
        }else {
            return ReduxHandler.NON_EXIST
        }
    }

    setShelterDetailOf(shelter, shelterDetail) {
        this.store.dispatch({
            type: this.SET_ACTION_TYPE,
            collection: this.SHELTER_DETAIL_COLLECTION,
            shelter: shelter,
            shelterDetail: shelterDetail
        })
    }

    getSpeciesFor(family) {
        const speciesMap = this.store.getState().speciesMap
        if (speciesMap.has(family)) {
            return speciesMap.get(family)
        } else {
            return ReduxHandler.NON_EXIST
        }
    }

    setSpeciesFor(family, species) {
        this.store.dispatch({
            type: this.SET_ACTION_TYPE,
            collection: this.SPECIES_COLLECTION,
            family: family,
            species: species
        })
    }

    getPathFor(address) {
        const map = this.store.getState().boundaryPathMap
        if (map.has(address)) {
            return map.get(address)
        }else {
            return ReduxHandler.NON_EXIST
        }
    }

    setPathFor(address, path) {
        this.store.dispatch({
            type: this.SET_ACTION_TYPE,
            collection: this.BOUNDARY_PATH_COLLECTION,
            address: address,
            path: path
        })
    }
}

export default ReduxHandler