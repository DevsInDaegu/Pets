import { createStore } from "redux"
import reduxDevToolsSetting from "./reduxDevToolsSetting"

class ReduxHandler {

    ADD_ACTION_TYPE = "ADD_ACTION_TYPE"
    SET_ACTION_TYPE = "SET_ACTION_TYPE"
    AREA_COLLECTION = "AREA_COLLECTION"
    CITY_COLLECTION = "CITY_COLLECTION"
    SHELTER_COLLECTION = "SHELTER_COLLECTION"
    SPECIES_COLLECTION = "SPECIES_COLLECTION"

    static defaultStore = {
        areas: [],
        cityMap: new Map(),
        shelterMap: new Map(),
        speciesMap: new Map()
    }

    constructor() {
        this.store = createStore(this.setStore.bind(this), reduxDevToolsSetting())
    }

    setStore(state = ReduxHandler.defaultStore, action) {
        if(action.collection == null) {
            return state
        }
        switch (action.collection) {
            case this.AREA_COLLECTION:
                if(action.type === this.SET_ACTION_TYPE) {
                    return {...state, 
                        areas: action.areas}
                }
            case this.CITY_COLLECTION:
                if(action.type === this.ADD_ACTION_TYPE) {
                    const cityMap = new Map(state.cityMap)
                    cityMap.set(action.area, action.cities)
                    return {...state,
                        cityMap: cityMap
                    }
                }
            case this.SHELTER_COLLECTION:
                if(action.type === this.SET_ACTION_TYPE) {
                    const shelterMap = new Map(state.shelterMap)
                    shelterMap.set(action.city, action.shelters)
                    return {...state, 
                        shelterMap: shelterMap
                    }
                }
            case this.SPECIES_COLLECTION:
                if(action.type === this.SET_ACTION_TYPE) {
                    const speciesMap = new Map(state.speciesMap)
                    speciesMap.set(action.family, action.species)
                    return { ...state,
                        speciesMap: speciesMap
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
        const cityMap = this.store.getState().cityMap
        if (cityMap.has(area)) {
            return cityMap.get(area)
        }else {
            return []
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
        const shelterMap = this.store.getState().shelterMap
        if (shelterMap.has(city)) {
            return shelterMap.get(city)
        }else {
            return []
        }
    }

    setSheltersIn(city, shelters) {
        this.store.dispatch({
            type: this.SET_ACTION_TYPE,
            collection: this.SHELTER_COLLECTION,
            city: city,
            shelters: shelters
        })
    }

    getSpeciesFor(family) {
        const speciesMap = this.store.getState().speciesMap
        if (speciesMap.has(family)) {
            return speciesMap.get(family)
        }else {
            return []
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
}

export default ReduxHandler