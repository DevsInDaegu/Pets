import ReduxHandler from "../Helper/ReduxHander"
import AbandonedPetAPIHandler from "../Helper/AbandonedPetAPIHandler"

class PetFetcher {

    constructor(dataHandler) {
        this.dataHandler = dataHandler
        this.subscribe()
        this.loadFiles()
    }

    FETCH_TIMEOUT = 5_000 // seconds * 1000
    static EMPTY_RESPONSE_ERROR = "EMPTY_RESPONSE"
    currentPetFetchingController = null
    currentShelterFetchingController = null
    manuallyAbortedRequestIDs = new Set()

    loadFiles() {
        const areaFile = require("../Resources/APIResponses/area.json")
        const areas = areaFile.map(this.convertAreaObject)
        this.dataHandler.setAreas.bind(this.dataHandler)(areas)
        const cityFile = require("../Resources/APIResponses/city.json")
        cityFile.forEach((element) => {
            const area = areas.find((area) => parseInt(area.code) === parseInt(element.areaCode))
            const cities = element.cities.map(this.convertCityObject)
            this.dataHandler.addCitiesIn(area, cities)
        })
    }

    petFamilies = Object.freeze({
        DOG: "강아지", 
        CAT: "고양이",
        UNSPECIFIED: "기타"
    })

    subscribe() {
        this.dataHandler.subscribe((data) => {
            
        })
    }

    get areas() {
        return this.dataHandler.getAreas()
    }

    async fetchAreas() {
        console.error("Area responses are served as json file")
        // const url = AbandonedPetAPIHandler.createAreaReqURL()
        // return fetch(url.href)
        //     .then(response => response.json())
        //     .then(json => {
        //         return json.response.body.items.item.map(this.convertAreaObject)
        //     })
        //     .then((areas) => {
        //         this.dataHandler.setAreas.bind(this.dataHandler)(areas)
        //         return areas
        //     })
        //     .catch(error => {
        //         console.log("Fail to fetch areas", error)
        //     })
    }

    convertAreaObject({orgCd, orgdownNm}) {
        return {
            name: orgdownNm,
            code: orgCd
        }
    }

    getCitiesIn(area) {
        const storedCities = this.dataHandler.getCitiesIn(area)
        return storedCities
        // if (storedCities === ReduxHandler.NON_EXIST) {
        //     const fetched = await this.fetchCitiesIn(area)
        //     return {
        //         ...area,
        //         cities: fetched
        //     }
        // }
        // else {
        //     return {
        //         ...area,
        //         cities: storedCities
        //     }
        // } 
    }

    async fetchCitiesIn(area) {
        console.error("City responses are served as json file")
        // const url = AbandonedPetAPIHandler.createCityReqURL(area)
        // return fetch(url.href)
        // .then(response => response.json())
        // .then(json => {
        //     if(json.response.body.items.item !== undefined){
        //      const fetched = json.response.body.items.item.map(this.convertCityObject)
        //      this.dataHandler.addCitiesIn(area, fetched)
        //      return fetched
        //     }else {
        //         return []
        //     }
        // })
        // .catch ( error => {
        //     console.log(`Fail to fetch cities in ${area}`, error)
        // })
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

    fetchSheltersInIfNeeded(city) {
        const shelters = this.dataHandler.getSheltersIn(city)
        if(shelters.length === 0) {
            this.fetchSheltersIn(city)
        }
    }

    async getSheltersIn(city) {
        const storedShelters = this.dataHandler.getSheltersIn(city)
        if(storedShelters === ReduxHandler.NON_EXIST) {
            const fetched = await this.fetchSheltersIn(city)
            return {
                ...city,
                shelters: fetched
            }
        }
        else {
            return {
                ...city,
                shelters: storedShelters
            }
        }
    }

    async fetchSheltersIn(city) {
        if(this.currentShelterFetchingController !== null) {
            this.manuallyAbortedRequestIDs.add(this.currentShelterFetchingController.id)
            this.currentShelterFetchingController.abort()
        }
        this.manuallyAbortedRequestIDs.delete(city.name)
        const abortController = new AbortController()
        const timeoutId = setTimeout(() => abortController.abort(), this.FETCH_TIMEOUT)
        abortController.id = city.name
        this.currentShelterFetchingController = abortController
        const url = AbandonedPetAPIHandler.createShelterReqURL(city)
        return fetch(url.href, {
            signal: abortController.signal
        })
            .then(res => res.json())
            .then((json) => {
                const content = json.response.body.items.item 
                if (content === null || content === undefined) {
                    throw 'Empty content'
                }else {
                    const shelters = content.map((shelter) => this.convertShelterObject(shelter, city))
                    this.dataHandler.setSheltersIn(city, shelters)
                    return shelters
                }
            })
            .catch(error => {
                if(this.manuallyAbortedRequestIDs.has(city.name)) {
                    return
                }
                console.error(`Fail to fetch shelters in ${city.name}`, error)
                throw error
            })
    }

    convertShelterObject({careRegNo, careNm}, city) {
        return {
            registeredNumber: careRegNo,
            name: careNm,
            cityCode: city.code,
            areaCode: city.areaCode,
        }
    }

    async getShelterDetailOf(shelter) {
        const storedShelterDetail = this.dataHandler.getShelterDetailOf(shelter)
        if(storedShelterDetail === ReduxHandler.NON_EXIST) {
            const fetched = await this.fetchShelterDetailOf(shelter)
            return fetched
        }else {
            return storedShelterDetail
        }
    }

    async fetchShelterDetailOf(shelter) {
        const url = AbandonedPetAPIHandler.createShelterDetailReqURL(shelter)
        return fetch(url.href)
            .then(res => res.json())
            .then(json => {
                const content = json.response?.body?.items?.item
                if(content === undefined) {
                    throw PetFetcher.EMPTY_RESPONSE_ERROR
                }else {
                    const firstItem = content[0]
                    const shelterDetail = this.convertShelterDetail(firstItem)
                    shelterDetail.registeredNumber = shelter.registeredNumber
                    this.dataHandler.setShelterDetailOf(shelter, shelterDetail)
                    return shelterDetail
                }
            })
            .catch(error => console.error(`Fail to shelter detail for ${shelter.name}`, error))

    }

    convertShelterDetail(shelterDetail) {
        return {
            name: shelterDetail.careNm,
            affiliatedInstitute: shelterDetail.orgNm,
            category: shelterDetail.divisionNm,
            speciesCare: shelterDetail?.saveTrgtAnimal?.split("+") ?? null,
            address: shelterDetail.careAddr + (shelterDetail.jibunAddr ?? ""),
            coordinates: (shelterDetail.lat !== undefined && shelterDetail.lng !== undefined) ?  {
                lat: shelterDetail.lat,
                lng: shelterDetail.lng
            }: null,
            dateDesignated: new Date(shelterDetail.dsignationDate) ?? null,
            operation: {
                weekday: {
                    open: shelterDetail.weekCellStime === ":" ? null: shelterDetail.weekCellStime ?? null,
                    close: shelterDetail.weekCellEtime === ":" ? null: shelterDetail.weekCellEtime ?? null
                },
                weekend: {
                    open: shelterDetail.weekendOprStime === ":" ? null: shelterDetail.weekendOprStime ?? null,
                    close: shelterDetail.weekendOprEtime === ":" ? null: shelterDetail.weekendOprEtime ?? null
                },
                dayOff: shelterDetail?.closeDay?.split("+") ?? null,
            },
            resourceCount: {
                veterinarian: shelterDetail.vetPersonCnt ?? null,
                keeper: shelterDetail.specsPersonCnt ?? null,
                doctorOffice: shelterDetail.medicalCnt ?? null,
                breedingFacility: shelterDetail.breedCnt ?? null,
                quarantineFacility: shelterDetail.quarabtineCnt ?? null,
                feedStorage: shelterDetail.feedCnt ?? null,
                ambulance: shelterDetail.transCarCnt ?? null
            },
            phoneNumber: shelterDetail.careTel,
            updatedAt: new Date(shelterDetail.dataStdDt) ?? null
        }
    }

    async getSpeciesFor(familyName) {
        const storedSpecies = this.dataHandler.getSpeciesFor(familyName)
        if(storedSpecies === ReduxHandler.NON_EXIST) {
            const fetched = await this.fetchSpeciesFor(familyName)
            return {
                name: familyName,
                species: fetched
            }
        }
        else {
            return {
                name: familyName,
                species: storedSpecies
            }
        }
    }

    async fetchSpeciesFor(familyName) {
        const url = AbandonedPetAPIHandler.createSpeciesReqURL(familyName)
        return fetch(url.href)
            .then(res => res.json())
            .then(json => {
                const content = json.response.body.items.item
                if(content === null || content === undefined) {
                    throw 'Empty content'
                }else {
                    const species = content.map(this.convertSpeciesObject)
                    this.dataHandler.setSpeciesFor(familyName, species)
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

    async fetchAbandonedPets({period, shelter, city, area, family, species}) {
        if(this.currentPetFetchingController !== null) {
            this.manuallyAbortedRequestIDs.add(this.currentPetFetchingController.id)
            this.currentPetFetchingController.abort()
        }
        this.manuallyAbortedRequestIDs.delete(city.name)
        const abortController = new AbortController()
        const timeoutId = setTimeout(() => abortController.abort(), this.FETCH_TIMEOUT)
        abortController.id = city.name
        this.currentPetFetchingController = abortController
        const url = AbandonedPetAPIHandler.createAbandonmentPetsReqURL({
            period,
            shelter: shelter ?? null,
            city, 
            area,
            familyName: family?.name ?? null,
            speciesCode: species?.code ?? null
        })

        return fetch(url.href, {
            signal: abortController.signal
        })
        .then(res => (res.json()))
        .then(json => {
            const content = json.response.body.items.item
            if (content === null || content === undefined) {
                return []
            }
            return content.map(this.convertPetObject)
        })
        .catch((error) => {

            if(this.manuallyAbortedRequestIDs.has(city.name)) {
                return
            }
            console.error(`Fail to fetch abandonment pets`, error)
            throw error
        })
    }

    convertPetObject(object) {
        return {
            registeredNumber: object.desertionNo,
            imageURL: object.filename,
            abandonedInfo: {
                date: object.happenDt,
                place: object.happenPlace,
            },
            physicalInfo: {
                species: object.kindCd,
                age: object.age,
                weight: object.weight,
                sex: object.sexCd,
                neutering: object.neuterYn === "Y" ? true : (object.neuterYn === "N" ? false: null)
            },
            noticeInfo: {
                startDate: object.noticeSdt,
                endDate: object.noticeEdt,
                state: object.processState
            },
            shelter:{
                name: object.careNm,
                phoneNumber: object.careTel,
                officePhoneNumber: object.officetel,
                address: object.careAddr,
                nameOfInCharge: object.chargeNm,
            },
            note: object.specialMark
        }
    }
} 

export default PetFetcher