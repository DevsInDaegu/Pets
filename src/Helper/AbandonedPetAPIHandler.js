
class AbandonedPetAPIHandler {
    static config = {
        endpoint: "http://apis.data.go.kr/1543061/",
        
        encodedServiceKey: "%2Fsa3Ats%2FIoFo0APLYtHSWMVGsojvVd2xJrPIsKa%2FoAplK6r%2F1aKk11956DuL0Uzvt3wWIk2F3qVxBq3knoIxbQ%3D%3D",
        decodedServiceKey: "/sa3Ats/IoFo0APLYtHSWMVGsojvVd2xJrPIsKa/oAplK6r/1aKk11956DuL0Uzvt3wWIk2F3qVxBq3knoIxbQ=="
    }

    static createAreaReqURL(returnType = "json", numberOfAreas = 20) {
        this.checkReturnType(returnType)
        let path = "abandonmentPublicSrvc/sido"
        path += `?serviceKey=${this.config.encodedServiceKey}`
        path += `&numOfRow=${numberOfAreas}`
        path += `&pageNo=${1}`
        path += `&_type=${returnType}`
        return new URL(path,
            this.config.endpoint)
    }

    static createShelterDetailReqURL(shelter, returnType = "json") {
        this.checkReturnType(returnType)
        let path = "animalShelterSrvc/shelterInfo"
        path += `?serviceKey=${this.config.encodedServiceKey}`
        path += `&care_reg_no=${shelter.registeredNumber}`
        path += `&numOfRos=1`
        path += "&pageNo=1"
        path += "&_type=json"
        return new URL(path, this.config.endpoint)
    }

    static createCityReqURL(area, returnType = "json") {
        this.checkReturnType(returnType)
        let path = "abandonmentPublicSrvc/sigungu"
        path += `?serviceKey=${this.config.encodedServiceKey}`
        path += `&upr_cd=${area.code}`
        path += `&_type=${returnType}`
        return new URL(path, this.config.endpoint)
    }

    static createShelterReqURL(city, returnType = "json") {
        this.checkReturnType(returnType)
        let path = "abandonmentPublicSrvc/shelter"
        path += `?serviceKey=${this.config.encodedServiceKey}`
        path += `&upr_cd=${city.areaCode}`
        path += `&org_cd=${city.code}`
        path += `&_type=${returnType}`
        return new URL(path, this.config.endpoint)
    }

    static createSpeciesReqURL(family, returnType = "json") {
        this.checkReturnType(returnType)
        const familyCode = this.getFamilyCodeFor(family)
        let path = "abandonmentPublicSrvc/kind"
        path += `?serviceKey=${this.config.encodedServiceKey}`
        path += `&up_kind_cd=${familyCode}`
        path += `&_type=${returnType}`
        return new URL(path, this.config.endpoint)
    }

    static getFamilyCodeFor(family) {
        switch (family){
            case "DOG":
                return 417000
            case "CAT":
                return 422400
            case "UNSPECIFIED":
                return 429900
            default:
                throw `API code for ${family} is non-exist`
        }
    }

    static createAbandonmentPetsReqURL({period, area, city, shelter, familyName, speciesCode}, returnConfig = {itemCountOnPage: 100, pageNo: 1, type: "json"}) {
        this.checkReturnType(returnConfig.type)
        const startDateString = this.convertDateToString(period.start)
        const endDateString = this.convertDateToString(period.end)
        let path = 'abandonmentPublicSrvc/abandonmentPublic'

        path += `?bgnde=${startDateString}`
        path += `&endde=${endDateString}`
        if(shelter !== null) {
            path += `&care_reg_no=${shelter.registeredNumber}`
        }
        else if(city !== null) {
            path += `&org_cd=${city.code}`
        }
        else if(area !== null) {
            path += `&upr_cd=${area.code}`
        }
        if (speciesCode !== null) {
            path += `&kind=${speciesCode}`
        }
        else if(familyName != null ) {
            path += `&upkind=${this.getFamilyCodeFor(familyName)}`
        }
        path += `&pageNo=${returnConfig.pageNo}`
        path += `&numOfRows=${returnConfig.itemCountOnPage}`
        path += `&_type=${returnConfig.type}`
        path += `&serviceKey=${this.config.encodedServiceKey}`
        return new URL(path, this.config.endpoint)
    }

    static convertDateToString(date) {
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const numberOfDate = date.getDate()
        return `${year}${month < 10 ? `0${month}`: month}${numberOfDate < 10 ? `0${numberOfDate}`: numberOfDate}`
    }

    static checkReturnType(type) {
        console.assert(type === "json" || type === "xml",
            `Cannot use ${type} as return type \n API provide json or xml response only`)
    }
}

export default AbandonedPetAPIHandler