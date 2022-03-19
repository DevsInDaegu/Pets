export default class CityBoundaryFetcher {

    URLEndPoint = "https://nominatim.openstreetmap.org/search.php"
    static INVALID_RESPONSE_ERROR = "INVALID_RESPONSE"
    static EMPTY_RESONSE_ERROR = "EMPTY_RESPONSE"

    constructor(cityname) {
        this.cityname = cityname
    }

    async fetchPath() {
        let url = this.URLEndPoint
        url += `?q=${this.cityname}`
        url += `&polygon_geojson=1`
        url += `&format=json`
        return await fetch(url)
        .then(res => res.json())
        .then(json => {
            this.checkValidate(json)
            
            return json[0].geojson.coordinates[0].map(coordinates => ({
                lat: coordinates[1], // Coordinates ordered [LNG, LAT]
                lng: coordinates[0]
            }))
        })
    }

    checkValidate(result) {
        if(result.length === 0 ||
            result[0].geojson?.type !== "Polygon" ||
            result[0].geojson.coordinates === undefined)
        {
            throw CityBoundaryFetcher.INVALID_RESPONSE_ERROR
        }
        if(result[0].geojson.coordinates.length === 0) {
            throw CityBoundaryFetcher.EMPTY_RESONSE_ERROR
        }
    }
}