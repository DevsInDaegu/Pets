import React, { useEffect, useRef } from 'react'
import { Button, Alert } from '@mui/material'
import { renderToStaticMarkup } from 'react-dom/server';
import { LocationSearching, LocationDisabled } from '@mui/icons-material';

import GoogleMapHandler from '../Helper/googleMapHandler'
import SearchDialog from '../Component/mapDialog';

export default function PetMap({ googleMapHandler, dataStorage, lastFetchedLocation, requestDataForNewCoodinates, isMobileSize }) {

    const mapElement = useRef(null)
    const searchingWhenMovingMap = useRef(true)

    useEffect(() => {
        initMap()
    }, [])

    function initMap() {
        googleMapHandler.current = new GoogleMapHandler(mapElement.current, dataStorage)
        googleMapHandler.current.onMoved = onMapMoved
        googleMapHandler.current.createFailedGetLocationLabel = createFailedGetLocationLabel
        googleMapHandler.current.createLocationButton = createLocationButton
        googleMapHandler.current.createAddressLabel = createAddressLabel
        googleMapHandler.current.onClick = onClickMap
        if (!googleMapHandler.current.isScriptLoaded) {
            addScriptForLoad()
        } else {
            onScriptLoaded()
        }
    }

    function showUserCoordinate({ lat, lng }) {
        if (lat === undefined || lng === undefined) {
            return // Sometime this functions call when fetching data is failed
        }
        googleMapHandler.current.setLocation({ lat, lng })
        googleMapHandler.current.createUserLocationMarker()
        googleMapHandler.current.moveMapLocationTo({ lat, lng })
    }

    function createLocationButton() {
        const component = <Button style={{
            width: "10rem",
            height: "2rem"
        }}
        >
            <LocationSearching style={{
                marginRight: "0.5rem"
            }} />
            현위치로 이동</Button>

        const button = document.createElement("button")
        button.innerHTML = renderToStaticMarkup(component)
        return button
    }

    function createAutoSearchCheckbox() {

        const div = document.createElement("div")
        const component = <Alert icon={false}
            severity="info"
            variant="standard">
            <label>
                <input type="checkbox" style={{
                    accentColor: "white",
                    width: "1rem",
                    height: "1rem"
                }}
                /> 지도 움직이면 검색
            </label>
        </Alert>

        div.innerHTML = renderToStaticMarkup(component)
        const input = div.querySelector("input")
        input.addEventListener("change", () => {
            searchingWhenMovingMap.current = !searchingWhenMovingMap.current
        })
        input.checked = searchingWhenMovingMap.current
        googleMapHandler.current.addControlTo(GoogleMapHandler.controlPosition.BOTTOM_LEFT, div)
    }

    function createFailedGetLocationLabel() {
        const labelComponent = <Alert
            icon={<LocationDisabled fontSize="inherit" color="red" />}
            severity="error">
            위치정보 사용 불가
        </Alert>
        const label = document.createElement("div")
        label.innerHTML = renderToStaticMarkup(labelComponent)
        return label
    }

    function createAddressLabel(address) {
        const labelComponent = <Alert
            icon={false} 
            severity="info"
            variant="standard"
            >
            {address}
        </Alert>
        const label = document.createElement("div")

        label.innerHTML = renderToStaticMarkup(labelComponent)
        return label
    }

    function onMapMoved({ lat, lng, zoomLevel }) {
        if (!searchingWhenMovingMap.current || lastFetchedLocation.current === null) {
            return
        }
        const lastCoords = {
            lat: lastFetchedLocation.current.lat,
            lng: lastFetchedLocation.current.lng
        }
        const newCoords = { lat, lng }
        const distance = googleMapHandler.current.calcDistanceBetween(lastCoords, newCoords)
        const MIN_DISTANCE_FOR_NEW_REQUEST = 5000 // 5km
        if (distance > MIN_DISTANCE_FOR_NEW_REQUEST) {
            requestDataForNewCoodinates({ lat, lng })
        }
    }

    async function onClickMap(coordinates) {
        clearPreviousFocus()
        const address = await googleMapHandler.current.requestUserAddress(coordinates)
        const addressString = `${address.areaName} ${address.cityName}`

        const dialog = new SearchDialog({
            addressString,
            coordinates,
            onClickSearch: onClickSearch
        })
        dialog.setMap(googleMapHandler.current.map)
        googleMapHandler.current.openedWindow.push({
            marker: dialog
        })
        googleMapHandler.current.focusBoundary(addressString)
    }

    function onClickSearch(coordinates) {
        clearPreviousFocus()
        requestDataForNewCoodinates(coordinates)
    }

    function clearPreviousFocus() {
        googleMapHandler.current.closeAllWindows()
        googleMapHandler.current.removeFocusedBoundaryLineIfExist()
    }

    function addScriptForLoad() {

        const script = googleMapHandler.current.createLoadScript()
        script.onload = onScriptLoaded
        document.body.appendChild(script)
    }

    function onScriptLoaded() {
        googleMapHandler.current.initMap()
        requestUserLocation()
        createAutoSearchCheckbox()
    }

    function requestUserLocation() {
        if (!navigator.geolocation) {
            console.error("Browser not support geo location")
        } else {
            navigator.geolocation.getCurrentPosition((location) => {
                googleMapHandler.current.userLocationFetched = true
                googleMapHandler.current.showLocationInfo()

                handleUserCoordinate(location.coords)
            }, (error) => {
                console.error("Fail to get location ", error)
                googleMapHandler.current.userLocationFetched = false
                googleMapHandler.current.showLocationInfo()

                lastFetchedLocation.current = GoogleMapHandler.SEOUL_COORDINATES
                requestDataForNewCoodinates(lastFetchedLocation.current)
            });
        }

    }

    async function handleUserCoordinate(coordinates) {
        const lat = coordinates.latitude
        const lng = coordinates.longitude
        showUserCoordinate({ lat, lng })
        requestDataForNewCoodinates({ lat, lng })
    }
    return <div id="map"
        ref={mapElement}
        style={{
            width: isMobileSize ? "90vw" : '40vw',
            height: isMobileSize ? "90vw" : '40vw',
            alignSelf: "center"
        }} />
}