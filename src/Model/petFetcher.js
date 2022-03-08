import ReduxHandler from "../Helper/ReduxHander"
import APIHandler from "../Helper/APIHandler"

class PetFetcher {

    constructor() {
        this.reduxHandler = new ReduxHandler()
    }

    petFamilies = Object.freeze({
        DOG: "강아지", 
        CAT: "고양이",
        UNSPECIFIED: "기타"
    })

    onAreasChange = (areas) => {}
    subscribe() {
        this.reduxHandler.store.subscribe(() => {
            const data = this.reduxHandler.store.getState()
            this.onAreasChange(data.areas)
        })
    }

    async fetchAreas() {
        const url = APIHandler.createAreaReqURL()
        return fetch(url.href)
        .then(response => response.json())
        .then(json => {
            return json.response.body.items.item.map(this.convertAreaObject)
        })
        .then(this.reduxHandler.setAreas.bind(this.reduxHandler))
        .catch ( error => {
            console.log("Fail to fetch areas", error)
        })
    }

    convertAreaObject({orgCd, orgdownNm}) {
        return {
            name: orgdownNm,
            code: orgCd
        }
    }

    getAreas() {
        this.reduxHandler.getAreas()
    }

    async getCitiesIn(area) {
        const cities = this.reduxHandler.getCitiesIn(area)
        if (cities.length > 0) {
            return {
                ...area,
                cities: cities
            }
        } else {
            const fetched = await this.fetchCitiesIn(area)
            return {
                ...area,
                cities: fetched
            }
        }
    }

    async fetchCitiesIn(area) {

        const url = APIHandler.createCityReqURL(area)
        return fetch(url.href)
        .then(response => response.json())
        .then(json => {
            if(json.response.body.items.item !== undefined){
             const fetched = json.response.body.items.item.map(this.convertCityObject)
             this.reduxHandler.addCitiesIn(area, fetched)
             return fetched
            }else {
                return []
            }
        })
        .catch ( error => {
            console.log(`Fail to fetch cities in ${area}`, error)
        })
    }

    addCities({area, cityMap}) {
        this.setCities({
            type: "ADD",
            area,
            cityMap
        })
    }

    convertCityObject({uprCd, orgCd, orgdownNm}) {
        return {
            areaCode: uprCd, 
            code: orgCd,
            name: orgdownNm 
        }
    }

    async getSheltersIn(city) {
        const shelters = this.reduxHandler.getSheltersIn(city)
        if(shelters.length > 0) {
            return {
                ...city,
                shelters: shelters
            }
        }else {
            const fetched = await this.fetchSheltersIn(city)
            return {
                ...city,
                shelters: fetched
            }
        }
    }

    async fetchSheltersIn(city) {
        const url = APIHandler.createShelterReqURL(city)
        return fetch(url.href)
            .then(res => res.json())
            .then((json) => {
                const content = json.response.body.items.item 
                if (content === null || content === undefined) {
                    throw 'Empty content'
                }else {
                    const shelters = content.map((shelter) => this.convertShelterObject(shelter, city))
                    this.reduxHandler.setSheltersIn(city, shelters)
                    return shelters
                }
            })
            .catch(error => console.error(`Fail to fetch shelters in ${city}`, error))
    }

    convertShelterObject({careRegNo, careNm}, city) {
        return {
            registeredNumber: careRegNo,
            name: careNm,
            cityCode: city.code,
            areaCode: city.areaCode,
        }
    }

    async getSpeciesFor(familyName) {
        const species = this.reduxHandler.getSpeciesFor(familyName)
        if(species.length > 0) {
            return {
                name: familyName,
                species: species
            }
        }else {
            const fetched = await this.fetchSpeciesFor(familyName)
            return {
                name: familyName,
                species: fetched
            }
        }
    }

    async fetchSpeciesFor(familyName) {
        const url = APIHandler.createSpeciesReqURL(familyName)
        return fetch(url.href)
            .then(res => res.json())
            .then(json => {
                const content = json.response.body.items.item
                if(content === null || content === undefined) {
                    throw 'Empty content'
                }else {
                    const species = content.map(this.convertSpeciesObject)
                    this.reduxHandler.setSpeciesFor(familyName, species)
                    return species
                }
            })
            .catch(error => console.error(`Fail to fetch species for ${familyName}`, error))
    }

    convertSpeciesObject({kindCd, knm}) {
        return  {
            name: knm,
            code: kindCd
        }
    }

    async fetchAbandonmentPets({period, shelter, city, area, family, species}) {

        const url = APIHandler.createAbandonmentPetsReqURL({
            period,
            shelter,
            city, 
            area,
            familyName: family?.name ?? null,
            speciesCode: species?.code ?? null
        })
        console.log("Call api", url.href)
        return fetch(url.href)
        .then(res => (res.json()))
        .then(json => {
            const content = json.response.body.items.item
            if (content == null) {
                return []
            }
            return content
        })
        .catch((error) => console.error(`Fail to fetch abandonment pets`, error))
    }
} 

export default new PetFetcher()