import CityBoundaryFetcher from './cityBoundaryFetcher';
import ReduxHandler from './ReduxHander';

export default class GoogleMapHandler {

    static LOAD_GOOGLE_MAP_SCRIPT_ID = "LOAD_GOOGLE_MAP_SCRIPT"
    static SEOUL_COORDINATES = {
        lat: 37.532600,
        lng: 127.024612
    }
    static NOT_FOUND_ERROR = "NOT_FOUND"
    static FAIL_TO_FETCH_ERROR = "FAIL_TO_FETCH_ERROR"
    static controlPosition = {
        TOP_RIGHT: "TOP_RIGHT",
        TOP_LEFT: "TOP_LEFT",
        BOTTOM_RIGHT: "BOTTOM_RIGHT",
        BOTTOM_LEFT: "BOTTOM_LEFT",
        CENTER: "CENTER"
    }
    
    config = {
        jsMapEndpoint: "https://maps.googleapis.com/maps/api/js",
        reverseGeocodingEndpoint: "https://maps.googleapis.com/maps/api/geocode/json",
        // API_key: "AIzaSyC3aUchRLwci0aU6ISGRRohmz1iuGU0vic", // bartshin
        API_key: "AIzaSyAg6ecXzlX7ECFfTDk_hDwZKAmwxK6QBvg", // bhwashin
        region: "KR",
        language: "ko"
    }
    mapStyle = require('../Resources/cartoonMapStyle.json')
    showingCityBoundaries = []
    focusedCityBoundaries = []
    userLocationFetched = false
    openedWindow = []

    constructor(mapElement, dataHandler) {
        this.mapElement = mapElement
        this.dataHandler = dataHandler
        this.userLocation = GoogleMapHandler.SEOUL_COORDINATES
    }

    createLocationButton() {
        console.error("Location button is not specified")
    }

    createFailedGetLocationLabel() {
        console.error("Failed get location label is not specified")
    }

    createAddressLabel(address) {
        console.error("Address label is not specified")
    }

    onMoved() {
        console.error("On moved map function is not implemented")
    }

    onClick() {
        console.error("On click map is not implemented")
    }

    setLocation(location) {
        this.userLocation = location
    }

    showAddress(address) {
        this.removeAllControlAtPostionIfExist(GoogleMapHandler.controlPosition.TOP_LEFT)
        this.removeShowingBoundaryLineIfExist()
        this.showLabelFor(address)
        this.showBoundaryFor(address)
    }

    showLabelFor(address) {
        const label = this.createAddressLabel(address)
        this.map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(label);
    }

    addControlTo(position, control) {
        this.map.controls[window.google.maps.ControlPosition[position]].push(control);
    }

    removeAllControlAtPostionIfExist(position) {
        while(this.map.controls[window.google.maps.ControlPosition[position]].length > 0) {
            this.map.controls[window.google.maps.ControlPosition[position]].pop()
        }
    }

    async showBoundaryFor(address) {
        const boundary = await this.createBoundary({
            address: address,
            strokeColor: "#4D77FF",
            fillColor: "#00B4D8"
        })
        if (this.showingCityBoundaries.length === 0) {
            this.showingCityBoundaries.push(boundary)
            boundary.setMap(this.map)
        }
    }

    async focusBoundary(address) {
        try {
            const boundary = await this.createBoundary({
                address: address,
                strokeColor: "#4E9F3D",
                fillColor: "#65C18C"
            })
            if (this.focusedCityBoundaries.length === 0) {
                this.focusedCityBoundaries.push(boundary)
                boundary.setMap(this.map)
            }
        }catch (error){
            console.error(error)
        }
    }

    async createBoundary({address, fillColor, strokeColor}) {
        let path = this.dataHandler.getPathFor(address)
        if(path === ReduxHandler.NON_EXIST) {
            try {
                path = await this.fetchBoundaryPathFor(address)
            }catch(error) {
                throw error
            }
        } 
        const boundary = new window.google.maps.Polygon({
            path: path,
            geodesic: true,
            strokeColor: strokeColor,
            strokeOpacity: 1.0,
            strokeWeight: 2,
            fillColor: fillColor,
            fillOpacity: "0.5"
          })
          return boundary
    }

    async fetchBoundaryPathFor(address) {
        const pathFetcher = new CityBoundaryFetcher(address)
        try {
            const path = await pathFetcher.fetchPath()
            this.dataHandler.setPathFor(address, path)
            return path
        }catch (error){
            throw GoogleMapHandler.FAIL_TO_FETCH_ERROR
        }
    }

    removeShowingBoundaryLineIfExist() {
        while(this.showingCityBoundaries.length > 0) {
            const boundary = this.showingCityBoundaries.pop()
            boundary.setMap(null)
        }
    }

    removeFocusedBoundaryLineIfExist() {
        while(this.focusedCityBoundaries.length > 0) {
            const boundary = this.focusedCityBoundaries.pop()
            boundary.setMap(null)
        }
    }

    geoCodingAddressKey = {
        city: "locality",
        subCity: "sublocality_level_1",
        area: "administrative_area_level_1"
    }

    async requestUserAddress(location) {
        const geocodingResults = await this.requestReverseGeocoding(location)
        const mostAccurateComponents = geocodingResults.sort((lhs, rhs) => {
            return lhs.address_components.length < rhs.address_components.length
        })[0].address_components

        const area = this.getAddressComponentFrom(mostAccurateComponents, this.geoCodingAddressKey.area)
        const city = this.getAddressComponentFrom(mostAccurateComponents, this.geoCodingAddressKey.city) ||
            this.getAddressComponentFrom(mostAccurateComponents, this.geoCodingAddressKey.subCity)
        if(area === null || city === null) {
            console.log("Fail to find address from ",mostAccurateComponents)
            throw GoogleMapHandler.NOT_FOUND_ERROR
        } else {
            return {
                areaName: area,
                cityName: city
            }
        }
    }

    getAddressComponentFrom(components, key) {
        const found = components.find((component) => {
            return component.types.findIndex((type) => type === key) !== -1
        })
        return found?.long_name ?? null
    }

    async requestReverseGeocoding(location){
        
        const url = new URL(`${this.config.reverseGeocodingEndpoint}?latlng=${location.lat},${location.lng}&key=${this.config.API_key}&language=${this.config.language}`)
        return await fetch(url)
        .then( async res => await res.json())
        .then(json => {
            return json.results
        })
        .catch((error) => {
            console.error(`Fail to fetch geocoding for ${location}`, error.message)
            throw GoogleMapHandler.NOT_FOUND_ERROR
        })
    }

    get isScriptLoaded() {
        const foundLoadScriptIndex = Array.from(document.scripts).findIndex((script) => {
            return GoogleMapHandler.LOAD_GOOGLE_MAP_SCRIPT_ID === script.id
        })
        return foundLoadScriptIndex !== -1
    }

    createLoadScript() {
        const script = document.createElement('script')
        script.src = `${this.config.jsMapEndpoint}?key=${this.config.API_key}&region=${this.config.region}&language=${this.config.language}&libraries=geometry&v=weekly`
        script.async = true
        script.id = GoogleMapHandler.LOAD_GOOGLE_MAP_SCRIPT_ID
        return script
    }

    initMap() {
        const mapOptions = {
            zoom: 11,
            center: new window.google.maps.LatLng(this.userLocation.lat, this.userLocation.lng),
            styles: this.mapStyle,
            zoomControl: true,
            gestureHandler: "cooperative",
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: true,
            fullscreenControl: false,
            restriction: {
                latLngBounds: {
                  north: 38.5,
                  south: 33,
                  east: 132,
                  west: 124,
                }
            }
        }
        this.map = new window.google.maps.Map(this.mapElement, mapOptions);
        this.map.addListener('zoom_changed', this.createUserLocationMarker.bind(this))
        this.map.addListener('center_changed', () => {
            const lat = this.map.center.lat()
            const lng = this.map.center.lng()
            const zoomLevel = this.map.zoom
            this.onMoved({lat, lng, zoomLevel})
        })
        this.map.addListener('click', (event) => {
            const coordinates = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            }
            this.onClick(coordinates)
        })
    }

    showLocationInfo() {
        if (this.userLocationFetched) {
            this.addUserLocationButton()
        } else {
            this.addFailedGetLocationLabel()
        }
    }

    addUserLocationButton() {
        const locationButton = this.createLocationButton()
        locationButton.addEventListener('click', () => {
            this.moveMapLocationTo(this.userLocation)
        })
        this.addControlTo(GoogleMapHandler.controlPosition.TOP_RIGHT, locationButton)
    }

    addFailedGetLocationLabel() {
        const label = this.createFailedGetLocationLabel()
        this.addControlTo(GoogleMapHandler.controlPosition.TOP_RIGHT, label)
    }

    moveMapLocationTo(location) {
        this.map.setCenter(location);
    }

    createUserLocationMarker() {
        if(this.userLocationMarker !== undefined) {
          this.userLocationMarker.setMap(null)  
        }
        this.userLocationMarker = this.createMarkerTo(this.userLocation, this.userLocationIcon)
    }

    get userLocationIcon() {
        const isZoomedOut = this.map.zoom < 10
        const path = isZoomedOut ? window.google.maps.SymbolPath.CIRCLE : "M7.5 0.5V14.5M14.5 7.49548H0.5M13.5 7.49548C13.5 10.8063 10.813 13.5 7.5 13.5C4.187 13.5 1.5 10.8063 1.5 7.49548C1.5 4.18464 4.187 1.49939 7.5 1.49939C10.813 1.49939 13.5 4.18464 13.5 7.49548Z"
        const scale = isZoomedOut ? 5 :  parseFloat(this.map.zoom) * 1.5 / 10
        const anchor = isZoomedOut ? new window.google.maps.Point(0, 0) :new window.google.maps.Point(10, 10)
        const icon = {
            path: path,
            strokeColor: "#4D77FF",
            fillColor: isZoomedOut ? "blue": "#9ADCFF",
            fillOpacity: isZoomedOut ? 1: 0.5,
            strokeWeight: 1.5,
            rotation: 0,
            scale: scale,
            anchor: anchor
        }
        return icon
    }

    createMarkerTo(location, markerIcon) {
        return new window.google.maps.Marker( {
            position: location,
            map: this.map,
            icon: markerIcon
        })
    }

    closeAllWindows() {
        while(this.openedWindow.length > 0) {
            const { window, marker } = this.openedWindow.pop() 
            window?.close()
            marker?.setMap(null)
        }
    }

    openWindow({ coordinates, contentString, title = "" }) {
        const marker = new window.google.maps.Marker({
            position: coordinates,
            map: this.map,
            title: title,
        })
        const infowindow = new window.google.maps.InfoWindow({
            content: contentString,
        })
        infowindow.open({
            anchor: marker,
            map: this.map,
            shouldFocus: false,
        })
        marker.addListener("click", () => {
            infowindow.open({
                anchor: marker,
                map: this.map,
                shouldFocus: false,
            })
        })
        this.openedWindow.push({
            window: infowindow,
            marker: marker
        })
    }

    calcDistanceBetween(a, b) {
        return window.google.maps.geometry.spherical.computeDistanceBetween(a, b)
    }
}